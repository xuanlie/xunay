XuNay Python 后端

FastAPI + Pydantic + SQLite。

运行

    cd backends/python
    pip install fastapi uvicorn pydantic
    python -m uvicorn main:app --host 0.0.0.0 --port 12346

端口 12346。

结构

  routes.json  → shared/routes.json（唯一真相源）
  schemas.py   → Pydantic 数据模型
  db.py        → SQLite
  handlers.py  → 业务函数
  main.py      → 自动注册路由
