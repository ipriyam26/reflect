from fastapi import FastAPI, HTTPException

from lang import Model
from fastapi.middleware.cors import CORSMiddleware
from models import Action, Response, Request


app = FastAPI()

origins = [
    "http://localhost:8000",
    "http://localhost:5173",
    "http://yourfrontenddomain.com",
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


@app.post("/first_response/")
async def first_response(data: Request) -> Response:
    query = ""
    try:
        if data.query == "ok":
            with open("ok.html", "r") as f:
                res = {
                    "type": "N",
                    "id": "",
                    "html": f.read(),
                }
                return Response(
                    actions=[Action(**res)],
                    history=f"\nHuman:Help me design a good looking bakery website\n",
                )

        if data.history:
            query = f"""Element: {data.html}`
            Query: {data.query}"""
            print("senior dev")
            return model.junior_dev(query, data.history)
        else:
            query = data.query
            print("design dev")
            return model.design_dev(query, data.history)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Something went wrong: {e}")


@app.post("/fix_shit/")
async def fix_shit(data: Request) -> Response:
    query = ""
    if data.html:
        query = f"""Element: {data.html}
        Query: {data.query}"""
    else:
        query = data.query
    try:
        return model.junior_dev(query, data.history)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Something went wrong: {e}")
