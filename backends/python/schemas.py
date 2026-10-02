from typing import Optional
from pydantic import BaseModel, field_validator
import time


class Todo(BaseModel):
    id: int = 0
    title: str = ""
    done: bool = False
    created_at: Optional[float] = None

    @field_validator("title")
    @classmethod
    def check_title(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("title 不能为空")
        if len(v) > 200:
            raise ValueError("title 最多 200 字")
        return v


class TodoIn(BaseModel):
    id: Optional[int] = None

    def check_id(self):
        if not self.id or self.id <= 0:
            raise ValueError("id 必填")
