#pragma once
#include "schemas.h"
#include <vector>
#include <string>

bool initDB();
void closeDB();

std::vector<Todo> listTodos();
int insertTodo(Todo& t);
bool toggleTodo(int id);
bool deleteTodo(int id);

bool saveToken(const std::string& token, const std::string& ip, long long expiresAt);
bool checkToken(const std::string& token);
void cleanupTokens();
