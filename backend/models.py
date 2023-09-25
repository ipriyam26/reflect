from pydantic import BaseModel


class Request(BaseModel):
    html: str
    query: str
    history: str 

class Response(BaseModel):
    type: str
    id: str 
    html: str
    history: str 

class Error(BaseModel):
    detail: str