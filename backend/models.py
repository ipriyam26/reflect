from typing import List
from pydantic import BaseModel


class Request(BaseModel):
    html: str
    query: str
    history: str


class Action(BaseModel):
    type: str
    id: str
    html: str


class Response(BaseModel):
    actions: List[Action]
    history: str


class Error(BaseModel):
    detail: str
