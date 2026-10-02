cmake_minimum_required(VERSION 3.15)
project(xunay-backend CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(SQLite3 REQUIRED)
find_package(Threads REQUIRED)

add_executable(server
  main.cpp
  db.cpp
  handlers.cpp
)

target_link_libraries(server PRIVATE SQLite::SQLite3 Threads::Threads)

target_include_directories(server PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/vendor)
