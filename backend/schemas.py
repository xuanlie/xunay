from pydantic import BaseModel
from typing import Optional


class TodoIn(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
