#include "httplib.h"
#include "db.h"
#include "handlers.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <iostream>
#include <sstream>
#include <cstdlib>

using json = nlohmann::json;

static std::vector<RouteSpec> loadRoutes() {
    std::ifstream f("../../shared/routes.json");
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

static int loadPort() {
    std::ifstream f("../../xunay.config.json");
    if (!f.is_open()) { std::cerr << "读 xunay.config.json 失败" << std::endl; exit(1); }
    std::stringstream ss; ss << f.rdbuf();
    auto j = json::parse(ss.str());
    return j["ports"]["cpp"].get<int>();
}

int main() {
    if (!initDB()) { std::cerr << "数据库初始化失败" << std::endl; return 1; }

    auto routes = loadRoutes();
    int port = loadPort();
    if (const char* env = std::getenv("XUNAY_PORT")) {
        try { port = std::stoi(env); } catch (...) {}
    }

    httplib::Server svr;
    registerAll(svr, routes);

    std::cout << "加载 " << routes.size() << " 个路由" << std::endl;
    std::cout << "XuNay C++ 后端 :" << port << std::endl;
    svr.listen("0.0.0.0", port);

    closeDB();
    return 0;
}
