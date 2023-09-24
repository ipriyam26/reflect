from typing import Dict
from fastapi import FastAPI

from lang import Model
from fastapi.middleware.cors import CORSMiddleware
from models import Response, Request

# class Request(BaseModel):
#     html: str
#     query: str
#     history: str


app = FastAPI()
model: Model = None

origins = [
    "http://localhost:8000",  # Allow localhost during development
    "http://localhost:5173",
    "http://yourfrontenddomain.com",
    # Add any other frontend addresses from where you want to allow requests
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.on_event("startup")
# async def startup_event():
#     global model
model = Model()


@app.get("/health")
def read_health():
    return {"status": "healthy"}


@app.post("/process_response", response_model=Response)
async def process_html(data: Request):
    query = ""
    if data.html:
        query = f"""Element: {data.html}
        Query: {data.query}"""
    else:
        query = data.query

    return model.run(query, data.history)
