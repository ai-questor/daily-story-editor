# banner.py
import io, base64
from PIL import Image
from deep_translator import GoogleTranslator

from pipeline.background_removal import remove_background, get_sam_mask
from pipeline.diffusion import generate_inpainted_background
from pipeline.upscaler import upscale_image
from pipeline.compositor import add_text_overlay
from pipeline.utils import resize_with_padding
from pipeline.prompt_builder import build_korean_prompt

def translate_to_english(text: str) -> str:
    return GoogleTranslator(source='ko', target='en').translate(text)

def compose_final(bg: Image.Image, obj: Image.Image) -> Image.Image:
    """
    인페인팅된 배경(bg)과 원본 오브젝트(obj)를 합성하여 최종 결과 생성
    """
    bg = bg.convert("RGBA")
    obj = obj.convert("RGBA").resize(bg.size)
    return Image.alpha_composite(bg, obj)

def generate_banner(file_bytes: bytes, menu: str, context: str, tone: str,
                    channel: str, required_words: str, banned_words: str,
                    text_overlay: str) -> str:
    print('1) 배경 제거 → 제품만 남기기')
    # 제품 RGBA 이미지 (오브젝트 보존)
    product_rgba = remove_background(file_bytes, method='sam')

    print('2) 비율 유지 + 패딩')
    product_padded = resize_with_padding(product_rgba, (512, 512))

    print('3) SAM 마스크 준비 (배경만 인페인팅 대상)')
    mask_resized = get_sam_mask(file_bytes, invert=True).resize((512, 512))

    print('4) 인페인팅으로 배경 생성')
    prompt = build_korean_prompt(menu, context, tone, channel)
    # prompt = f"{context}, {tone} 분위기, 광고 배경"
    english_prompt = translate_to_english(prompt)
    print('Original Prompt:', prompt)
    print('Target Prompt:', english_prompt)
    bg = generate_inpainted_background(
        product_padded.convert("RGB"),  # 제품 이미지는 그대로
        mask_resized,                   # 배경만 인페인팅
        english_prompt,
        use_sdxl=False
    )

    print('5) 최종 합성 (배경 + 원본 오브젝트)')
    composed = compose_final(bg, product_rgba)

    print('6) 텍스트 삽입')
    composed_with_text = add_text_overlay(composed, text_overlay or f"{menu} - 오늘의 추천 메뉴", tone)

    print('7) 업스케일')
    scale = 2 if channel == "피드" else 3
    composed_up = upscale_image(composed_with_text, scale=scale)

    print('8) 결과 base64 인코딩')
    buf = io.BytesIO()
    composed_up.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def generate_banner_mock(file_bytes: bytes, menu: str, context: str, tone: str,
                    channel: str, required_words: str, banned_words: str,
                    text_overlay: str) -> str:
    with open("temp/generated.png", "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")
