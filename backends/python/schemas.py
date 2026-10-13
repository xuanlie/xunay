import time
import uuid
from typing import Optional

from pydantic import BaseModel, field_validator


class Todo(BaseModel):
    id: Optional[str] = None
    title: str = ""
    done: bool = False
    created_at: Optional[int] = None

    @field_validator("title")
    @classmethod
    def check_title(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("title 不能为空")
        if len(v) > 200:
            raise ValueError("title 最多 200 字")
        return v

    def ensure(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = int(time.time() * 1000)
        return self


class TodoIn(BaseModel):
    id: str = ""

    def check_id(self):
        if not self.id:
            raise ValueError("id 必填")
        return self
