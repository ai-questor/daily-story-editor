# banner.py
import os, io, base64
from PIL import Image
from datetime import datetime
from deep_translator import GoogleTranslator
from google import genai
from google.genai import types

def translate_to_english(text: str) -> str:
    return GoogleTranslator(source='ko', target='en').translate(text)

def call_gemini_image_api(prompt: str, images: list[bytes]) -> Image.Image:
    """
    Gemini 3 Pro Image API 호출 → 여러 이미지를 함께 전달
    images: [product_bytes, person_bytes?, background_bytes?]
    """
    API_KEY = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=API_KEY)

    contents = [types.Part(text=prompt)]

    # 순서대로 inline_data 추가
    for img_bytes in images:
        contents.append(types.Part(
            inline_data=types.Blob(mime_type="image/png", data=img_bytes)
        ))

    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=contents,
        config=types.GenerateContentConfig(
            image_config=types.ImageConfig(
                aspect_ratio="1:1",
                image_size="2K"
            )
        )
    )

    for candidate in response.candidates:
        for part in candidate.content.parts:
            if part.inline_data:
                return part.as_image()

    raise ValueError("Gemini 응답에 이미지 데이터가 없습니다.")

def generate_banner(
    product_bytes: bytes,
    person_bytes: bytes | None,
    background_bytes: bytes | None,
    background_prompt: str,
    text_overlay: str,
    overlay_position: str,
    overlay_description: str,
) -> str:
    print("1) Build final prompt from user inputs")

    # background_prompt는 영어로 번역
    bg_prompt_en = translate_to_english(background_prompt) if background_prompt else ""

    # text_overlay는 한국어 그대로
    overlay_text_final = text_overlay or ""

    # overlay_description은 "한국어(영어)" 병기
    overlay_desc_final = overlay_description
    if overlay_description:
        overlay_desc_en = translate_to_english(overlay_description)
        overlay_desc_final = f"{overlay_description} ({overlay_desc_en})"

    # 위치 처리
    pos_phrase = (
        "place the overlay text automatically in the most readable area"
        if overlay_position == "auto"
        else f"place the overlay text at {overlay_position.replace('-', ' ')}"
    )

    # 이미지 순서 설명 (조건부)
    image_roles = ["- First image: product photo (must remain prominent)."]
    if person_bytes and background_bytes:
        image_roles.append("- Second image: person photo (include naturally).")
        image_roles.append("- Third image: background photo (use if provided).")
    elif person_bytes and not background_bytes:
        image_roles.append("- Second image: person photo (include naturally).")
    elif background_bytes and not person_bytes:
        image_roles.append("- Second image: background photo (use if provided).")

    # 최종 프롬프트 구성
    final_prompt = (
        f"Create a 1:1 promotional banner.\n"
        f"{chr(10).join(image_roles)}\n\n"
        f"For background theme: {bg_prompt_en or 'realistic restaurant/store interior'}.\n"
        f"Overlay text: \"{overlay_text_final}\". {pos_phrase}.\n"
        f"Styling notes: {overlay_desc_final}.\n"
        f"Ensure high contrast and legibility, commercial quality."
    ).strip()

    print("2) Gemini API call → composite with product/person/background")

    # 이미지 배열 구성 (조건부)
    images = [product_bytes]
    if person_bytes:
        images.append(person_bytes)
    if background_bytes:
        images.append(background_bytes)

    result_img = call_gemini_image_api(final_prompt, images)

    # 결과 저장 및 반환
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    temp_path = f"temp/generated-{timestamp}.png"
    os.makedirs("temp", exist_ok=True)
    result_img.save(temp_path)

    with open(temp_path, "rb") as f:
        img_bytes = f.read()

    return base64.b64encode(img_bytes).decode("utf-8")

def generate_banner_mock(
    product_bytes: bytes,
    person_bytes: bytes | None,
    background_bytes: bytes | None,
    background_prompt: str,
    text_overlay: str,
    overlay_position: str,
    overlay_description: str,
) -> str:
    with open("temp/generated-20251127-134459.png", "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")