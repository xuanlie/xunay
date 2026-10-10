#include "handlers.h"
#include "db.h"
#include <nlohmann/json.hpp>
#include <random>
#include <sstream>
#include <iomanip>
#include <ctime>
#include <stdexcept>

using json = nlohmann::json;

static std::string makeToken() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 15);
    std::stringstream ss;
    for (int i = 0; i < 32; i++) ss << std::hex << dis(gen);
    return ss.str();
}

static std::string respJSON(bool ok, const std::string& data, const std::string& err) {
    json j;
    j["ok"] = ok;
    if (!err.empty()) {
        j["data"] = nullptr;
        j["error"] = err;
    } else {
        try { j["data"] = json::parse(data.empty() ? "null" : data); }
        catch (...) { j["data"] = data; }
        j["error"] = nullptr;
    }
    return j.dump();
}

static void send(httplib::Response& res, int status, bool ok, const std::string& data, const std::string& err = "") {
    res.status = status;
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_content(respJSON(ok, data, err), "application/json; charset=utf-8");
}

void handleToken(const httplib::Request& req, httplib::Response& res) {
    cleanupTokens();
    std::string token = makeToken();
    long long expires = (long long)std::time(nullptr) + 300;
    if (!saveToken(token, req.remote_addr, expires)) {
        send(res, 500, false, "", "保存 token 失败");
        return;
    }
    json d; d["token"] = token;
    send(res, 200, true, d.dump());
}

void handleGetTodos(const httplib::Request&, httplib::Response& res) {
    auto todos = listTodos();
    json arr = json::array();
    for (auto& t : todos) {
        json item;
        item["id"] = t.id;
        item["title"] = t.title;
        item["done"] = t.done;
        arr.push_back(item);
    }
    send(res, 200, true, arr.dump());
}

void handleAddTodo(const httplib::Request& req, httplib::Response& res) {
    try {
        auto j = json::parse(req.body);
        Todo t;
        t.title = j.value("title", "");
        t.validate();
        int id = insertTodo(t);
        json d; d["id"] = id;
        send(res, 200, true, d.dump());
    } catch (const std::exception& e) {
        send(res, 400, false, "", e.what());
    }
}

void handleToggleTodo(const httplib::Request& req, httplib::Response& res) {
    try {
        auto j = json::parse(req.body);
        TodoIn in;
        in.id = j.value("id", 0);
        in.validateId();
        toggleTodo(in.id);
        send(res, 200, true, "null");
    } catch (const std::exception& e) {
        send(res, 400, false, "", e.what());
    }
}

void handleDeleteTodo(const httplib::Request& req, httplib::Response& res) {
    try {
        auto j = json::parse(req.body);
        TodoIn in;
        in.id = j.value("id", 0);
        in.validateId();
        deleteTodo(in.id);
        send(res, 200, true, "null");
    } catch (const std::exception& e) {
        send(res, 400, false, "", e.what());
    }
}

void registerAll(httplib::Server& svr, const std::vector<RouteSpec>& routes) {
    std::map<std::string, Handler> handlers = {
        {"handleToken",      handleToken},
        {"handleGetTodos",   handleGetTodos},
        {"handleAddTodo",    handleAddTodo},
        {"handleToggleTodo", handleToggleTodo},
        {"handleDeleteTodo", handleDeleteTodo}
    };

    svr.Options(R"(/rpc/.*)", [](const httplib::Request&, httplib::Response& res) {
        res.status = 204;
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Headers", "X-Token, Content-Type");
    });

    for (const auto& r : routes) {
        auto it = handlers.find(r.handler);
        if (it == handlers.end()) {
            std::cerr << "缺 handler: " << r.handler << std::endl;
            exit(1);
        }
        auto fn = it->second;
        auto wrapped = [fn, r](const httplib::Request& req, httplib::Response& res) {
            if (r.auth) {
                if (!req.has_header("X-Token")) {
                    send(res, 403, false, "", "无效 token");
                    return;
                }
                auto tok = req.get_header_value("X-Token");
                if (!checkToken(tok)) {
                    send(res, 403, false, "", "无效 token");
                    return;
                }
            }
            fn(req, res);
        };
        if (r.method == "GET") svr.Get(r.path, wrapped);
        else svr.Post(r.path, wrapped);
    }
}
