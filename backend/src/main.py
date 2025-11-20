from fastapi import FastAPI, HTTPException
from models import GeneratePayload, GenerateResult
from services import generate_text
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/generate", response_model=GenerateResult)
async def generate(payload: GeneratePayload):
    try:
        result = generate_text(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
