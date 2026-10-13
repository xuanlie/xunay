#pragma once
#include "schemas.h"
#include <vector>
#include <string>

bool initDB();
void closeDB();

std::vector<Todo> listTodos();
std::string insertTodo(const Todo& t);
bool toggleTodo(const std::string& id);
bool deleteTodo(const std::string& id);

bool saveToken(const std::string& token, const std::string& ip, long long expiresAt);
bool checkToken(const std::string& token);
void cleanupTokens();
