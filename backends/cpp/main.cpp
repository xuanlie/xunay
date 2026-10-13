#include "httplib.h"
#include "db.h"
#include "handlers.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <iostream>
#include <sstream>
#include <cstdlib>
#include <filesystem>

namespace fs = std::filesystem;
using json = nlohmann::json;

static std::string findRoot() {
    if (const char* env = std::getenv("XUNAY_ROOT")) return env;
    fs::path dir = fs::current_path();
    while (true) {
        if (fs::exists(dir / "xunay.config.json")) return dir.string();
        fs::path parent = dir.parent_path();
        if (parent == dir || parent.empty()) break;
        dir = parent;
    }
    return "";
}

static std::vector<RouteSpec> loadRoutes(const std::string& root) {
    std::ifstream f(root + "/shared/routes.json");
    if (!f.is_open()) { std::cerr << "读 routes.json 失败" << std::endl; exit(1); }
    std::stringstream ss; ss << f.rdbuf();
    auto j = json::parse(ss.str());
    std::vector<RouteSpec> out;
    for (auto& r : j["routes"]) {
        RouteSpec s;
        s.name = r["name"]; s.method = r["method"]; s.path = r["path"];
        s.auth = r["auth"]; s.handler = r["handler"];
        out.push_back(s);
    }
    return out;
}

static int loadPort(const std::string& root) {
    std::ifstream f(root + "/xunay.config.json");
    if (!f.is_open()) { std::cerr << "读 xunay.config.json 失败" << std::endl; exit(1); }
    std::stringstream ss; ss << f.rdbuf();
    auto j = json::parse(ss.str());
    return j["ports"]["backend"].get<int>();
}

int main() {
    std::string root = findRoot();
    if (root.empty()) { std::cerr << "找不到 xunay.config.json" << std::endl; return 1; }

    if (!initDB()) { std::cerr << "数据库初始化失败" << std::endl; return 1; }

    auto routes = loadRoutes(root);
    int port = loadPort(root);
    if (const char* env = std::getenv("XUNAY_PORT")) {
        try { port = std::stoi(env); } catch (...) {}
    }

    httplib::Server svr;
    registerAll(svr, routes);

    std::cout << "加载 " << routes.size() << " 个路由" << std::endl;
    std::cout << "XuNay C++ 后端 :" << port << std::endl;
    if (!svr.listen("0.0.0.0", port)) {
        std::cerr << "listen 失败（端口 " << port << " 被占？）" << std::endl;
        return 1;
    }

    closeDB();
    return 0;
}
