# banner.py
import io, base64
from PIL import Image
from deep_translator import GoogleTranslator

from pipeline.background_removal import remove_background, get_sam_mask
from pipeline.diffusion import generate_inpainted_background
from pipeline.upscaler import upscale_image
from pipeline.compositor import add_text_overlay
from pipeline.utils import resize_with_padding

def translate_to_english(text: str) -> str:
    return GoogleTranslator(source='ko', target='en').translate(text)

def compose_final(bg: Image.Image, obj: Image.Image) -> Image.Image:
    """
    인페인팅된 배경(bg)과 원본 오브젝트(obj)를 합성하여 최종 결과 생성
    """
    bg = bg.convert("RGBA")
    obj = obj.convert("RGBA").resize(bg.size)
    return Image.alpha_composite(bg, obj)

# prompt_builder.py
def build_korean_prompt(menu: str, context: str, tone: str, channel: str) -> str:

    # 메뉴 → 장소 매핑
    if any(word in menu for word in ["커피", "차", "음료"]):
        place = "아늑한 카페 내부"
    elif any(word in menu for word in ["밥", "국", "찌개"]):
        place = "현실적인 한식당 내부"
    elif any(word in menu for word in ["우동", "라멘", "스시"]):
        place = "정통적인 일식당 내부"
    elif any(word in menu for word in ["피자", "파스타"]):
        place = "서양식 레스토랑 내부"
    elif any(word in menu for word in ["치킨", "버거"]):
        place = "패스트푸드점 내부"
    elif any(word in menu for word in ["디저트", "케이크"]):
        place = "디저트 카페 내부"
    else:
        place = "현실적인 식당이나 매장 내부"

    # tone 매핑
    tone_map = {
        "따뜻함": "따뜻하고 아늑한 분위기",
        "유머": "재미있고 유쾌한 분위기",
        "프리미엄": "고급스럽고 세련된 분위기",
        "담백": "깔끔하고 단순한 분위기"
    }
    tone_desc = tone_map.get(tone, tone)

    # channel 매핑
    channel_map = {
        "피드": "현실적인 사진 스타일, SNS 피드용",
        "스토리": "세로형 구도, 눈에 띄는 색감"
    }
    channel_desc = channel_map.get(channel, "")

    # 프롬프트 조합 (context는 그대로 포함)
    prompt = f"{place}, {context}, {tone_desc}, {channel_desc}, 실제 촬영한 듯한 배경"

    return prompt


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
