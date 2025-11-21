from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import GeneratePayload, GenerateResult
from models import BannerResult
from services.text import generate_text
from services.banner import generate_banner

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

@app.post("/api/generate-banner", response_model=BannerResult)
async def generate_banner_api(
    file: UploadFile = File(...),
    menu: str = Form(...),
    context: str = Form(...),
    tone: str = Form(...),
    channel: str = Form(...),
    required_words: str = Form(""),
    banned_words: str = Form(""),
    text_overlay: str = Form(None),
):
    try:
        print('Generate banner..')
        file_bytes = await file.read()
        b64 = generate_banner(file_bytes, menu, context, tone, channel,
                              required_words, banned_words, text_overlay)
        return BannerResult(image_base64=b64)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))