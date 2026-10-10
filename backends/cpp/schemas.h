#pragma once
#include <string>
#include <ctime>
#include <stdexcept>

struct Todo {
    int id = 0;
    std::string title;
    bool done = false;
    long long created_at = 0;

    void validate() {
        // trim
        size_t start = title.find_first_not_of(" \t\n\r");
        size_t end = title.find_last_not_of(" \t\n\r");
        if (start == std::string::npos) {
            throw std::invalid_argument("title 不能为空");
        }
        title = title.substr(start, end - start + 1);
        if (title.size() > 200) {
            throw std::invalid_argument("title 最多 200 字");
        }
        if (created_at == 0) {
            created_at = std::time(nullptr);
        }
    }
};

struct TodoIn {
    int id = 0;
    std::string title;

    void validateId() {
        if (id <= 0) {
            throw std::invalid_argument("id 必填");
        }
    }
};

struct TokenIn {
    std::string token;

    void validate() {
        if (token.size() != 32) {
            throw std::invalid_argument("token 长度必须为 32");
        }
    }
};

struct Response {
    bool ok = true;
    std::string data;   // JSON 字符串
    std::string error;  // 空表示无错误
};

inline Response ok(const std::string& data) {
    Response r;
    r.ok = true;
    r.data = data;
    return r;
}

inline Response fail(const std::string& msg) {
    Response r;
    r.ok = false;
    r.data = "null";
    r.error = msg;
    return r;
}
