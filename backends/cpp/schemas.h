#pragma once
#include <string>
#include <chrono>
#include <random>
#include <sstream>
#include <iomanip>
#include <stdexcept>

inline long long nowMs() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
}

inline std::string newUUID() {
    static std::random_device rd;
    static std::mt19937_64 gen(rd());
    static std::uniform_int_distribution<uint64_t> dis;
    uint64_t a = dis(gen), b = dis(gen);
    char buf[40];
    snprintf(buf, sizeof(buf), "%08x-%04x-%04x-%04x-%012llx",
        (unsigned)(a >> 32),
        (unsigned)((a >> 16) & 0xffff),
        (unsigned)((a & 0x0fff) | 0x4000),
        (unsigned)((b >> 48) & 0x3fff) | 0x8000,
        (unsigned long long)(b & 0xffffffffffffULL));
    return std::string(buf);
}

inline std::string makeToken32() {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    std::uniform_int_distribution<> d(0, 15);
    std::stringstream ss;
    for (int i = 0; i < 32; i++) ss << std::hex << d(gen);
    return ss.str();
}

struct Todo {
    std::string id;
    std::string title;
    bool done = false;
    long long created_at = 0;

    void validate() {
        size_t start = title.find_first_not_of(" \t\n\r");
        size_t end = title.find_last_not_of(" \t\n\r");
        if (start == std::string::npos) throw std::invalid_argument("title 不能为空");
        title = title.substr(start, end - start + 1);
        if (title.size() > 200) throw std::invalid_argument("title 最多 200 字");
        if (id.empty()) id = newUUID();
        if (created_at == 0) created_at = nowMs();
    }
};

struct TodoIn {
    std::string id;
    void validateId() {
        if (id.empty()) throw std::invalid_argument("id 必填");
    }
};

struct Response {
    bool ok = true;
    std::string data;
    std::string error;
};
