XuNay C++ 后端

httplib + nlohmann/json + SQLite。

依赖

下载两个 header 到 vendor/：

    mkdir -p vendor
    cd vendor
    curl -O https://raw.githubusercontent.com/yhirose/cpp-httplib/master/httplib.h
    curl -O https://raw.githubusercontent.com/nlohmann/json/develop/single_include/nlohmann/json.hpp

编译

    cd backends/cpp
    mkdir build && cd build
    cmake ..
    make

运行

    ./server

端口 12344。

接口

    GET  /rpc/token
    GET  /rpc/getTodos
    POST /rpc/addTodo
    POST /rpc/toggleTodo
    POST /rpc/deleteTodo

校验

schemas.h 里每个 struct 有 validate() 方法。跟 Pydantic 一样。
