#pragma once
#include "httplib.h"
#include <vector>
#include <string>
#include <map>
#include <functional>

struct RouteSpec {
    std::string name, method, path, handler;
    bool auth = false;
};

using Handler = std::function<void(const httplib::Request&, httplib::Response&)>;

void registerAll(httplib::Server& svr, const std::vector<RouteSpec>& routes);
