import os
import base64
import requests
from PIL import Image
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import GeneratePayload, GenerateResult, BannerResult
from services.storage import upload_to_gcs_and_instagram
from services.text import generate_text
#from services.banner import generate_banner
from services.banner import generate_banner_mock as generate_banner

load_dotenv()
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
        print(e)
        # 임시 Mock 데이터
        # return GenerateResult(
        #     captions=[
        #         "서울의 맛, 차가운 김치가 김치페스티벌에서 여러분을 기다립니다. 프리미엄 품질로 완성된 우리의 김치는 한입에 담긴 깊은 풍미로 여러분의 미각을 사로잡을 것입니다. 특별한 하루, 특별한 맛을 경험해보세요.",
        #         "김치의 새로운 차원을 만나보세요. 서울의 차가운 김치, 그 깊은 맛과 신선함은 오직 김치페스티벌에서만 느낄 수 있습니다. 프리미엄 김치로 여러분의 식탁을 더욱 풍성하게 만들어보세요.",
        #         "서울의 전통을 현대적으로 재해석한 차가운 김치! 김치페스티벌에서 최고의 맛을 경험하고, 서울의 자부심을 느껴보세요. 여러분의 입맛을 사로잡을 준비가 되어 있습니다."
        #     ],
        #     one_liner="프리미엄 차가운 김치, 서울의 맛을 담다!",
        #     hashtags=["#서울김치", "#차가운김치", "#김치페스티벌", "#프리미엄맛", "#전통과현대"]
        # )
        # raise HTTPException(status_code=500, detail=str(e))

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
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-instagram")
async def upload_instagram(
    caption: str = Form(...),
    file: UploadFile = File(...),
):
    try:
        file_bytes = await file.read()
        result = upload_to_gcs_and_instagram(file_bytes, file.filename, caption)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
