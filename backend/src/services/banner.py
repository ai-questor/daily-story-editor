# banner.py
import os, io, base64
from PIL import Image
from deep_translator import GoogleTranslator
from google import genai
from google.genai import types
from pipeline.prompt_builder import build_korean_prompt

def translate_to_english(text: str) -> str:
    return GoogleTranslator(source='ko', target='en').translate(text)

def call_gemini_image_api(prompt: str, product_img: Image.Image) -> Image.Image:
    """
    Gemini 3 Pro Image API 호출 → 배경+문구 포함 이미지 생성 (SDK 버전)
    """
    API_KEY = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=API_KEY)

    buf = io.BytesIO()
    product_img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[
            types.Part(text=prompt),
            types.Part(
                inline_data=types.Blob(
                    mime_type="image/png",
                    data=img_bytes
                )
            )
        ],
        config=types.GenerateContentConfig(
            image_config=types.ImageConfig(
                aspect_ratio="1:1",   # 정사각형 배너
                image_size="2K"       # 2K 해상도
            )
        )
    )

    # ✅ 응답에서 이미지 추출
    for candidate in response.candidates:
        for part in candidate.content.parts:
            if part.inline_data:
                return part.as_image()  # PIL.Image.Image 객체 반환

    raise ValueError("Gemini 응답에 이미지 데이터가 없습니다.")

def generate_banner(file_bytes: bytes, menu: str, context: str, tone: str,
                    channel: str, required_words: str, banned_words: str,
                    text_overlay: str) -> str:
    print("1) 프롬프트 생성")
    prompt = build_korean_prompt(menu, context, tone, channel)
    english_prompt = translate_to_english(prompt)

    final_prompt = (
        f"{english_prompt}, keep product, replace background with realistic restaurant/store interior, "
        f"Christmas, luxurious atmosphere. Add the text: \"{text_overlay or menu} - 오늘의 추천 메뉴\""
    )

    print("2) Gemini API 호출 → 배경+문구 포함 이미지 생성 (2K)")
    product_img = Image.open(io.BytesIO(file_bytes))
    result_img = call_gemini_image_api(final_prompt, product_img)

    print("3) 결과 temp 파일 저장 후 다시 불러오기")
    temp_path = "temp/generated.png"
    os.makedirs("temp", exist_ok=True)  # temp 폴더 없으면 생성
    result_img.save(temp_path)          # PNG 자동 저장

    with open(temp_path, "rb") as f:
        img_bytes = f.read()

    return base64.b64encode(img_bytes).decode("utf-8")
