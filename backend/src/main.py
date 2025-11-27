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
    # try:
    #     result = generate_text(payload)
    #     return result
    # except Exception as e:
    #     print(e)
    #     raise HTTPException(status_code=500, detail=str(e))
    # 임시 Mock 데이터
    return GenerateResult(
        captions=[
            "연말의 차가운 바람이 스쳐 가도, 서울의 한 자락에서 만나는 따뜻한 우동은 브랜드의 품격을 더합니다. 원조 레시피의 깊은 육수와 쫄깃한 면발, 신선한 토핑이 어우러져 크리스마스의 여운까지 남기는 프리미엄 한 그릇입니다.",
            "크리스마스가 다가오는 연말, 서울의 프리미엄 우동으로 하루를 마무리하세요. 원조 맛의 육수에 정교하게 다듬은 면발과 고급 재료의 조합이 겨울밤을 따뜻하게 감싸고 도시의 분위기를 한층 돋굽니다.",
            "연말연시, 서울의 원조 프리미엄 우동으로 특별한 순간을 채워보세요. 포근한 국물과 신선한 재료의 조합이 다가오는 겨울밤을 따뜻하게 감싸고, 대표 메뉴로서의 브랜드 아이덴티티를 강화합니다."
        ],
        one_liner="원조의 깊은 맛, 서울의 크리스마스 분위기를 담은 따뜻한 우동—지금 바로 맛보세요.",
        hashtags=["#서울", "#원조", "#따뜻한우동", "#크리스마스", "#프리미엄"]
    )

@app.post("/api/generate-banner", response_model=BannerResult)
async def generate_banner_api(
    file_product: UploadFile = File(...),
    file_person: UploadFile | None = File(None),
    file_background: UploadFile | None = File(None),
    background_prompt: str = Form(""),
    text_overlay: str = Form(""),
    overlay_position: str = Form("auto"),
    overlay_description: str = Form(""),
):
    try:
        print("Generate banner..")

        product_bytes = await file_product.read()
        person_bytes = await file_person.read() if file_person else None
        background_bytes = await file_background.read() if file_background else None

        b64 = generate_banner(
            product_bytes=product_bytes,
            person_bytes=person_bytes,
            background_bytes=background_bytes,
            background_prompt=background_prompt,
            text_overlay=text_overlay,
            overlay_position=overlay_position,
            overlay_description=overlay_description,
        )
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
