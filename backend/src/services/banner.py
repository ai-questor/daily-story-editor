import io, base64
from PIL import Image
from rembg import remove
from pipeline.diffusion import generate_inpainted_background
from pipeline.upscaler import upscale_image
from pipeline.compositor import composite_product_on_bg, add_text_overlay

def generate_banner(file_bytes: bytes, menu: str, context: str, tone: str,
                    channel: str, required_words: str, banned_words: str,
                    text_overlay: str) -> str:
    # 1) 배경 제거 → 제품만 남기기
    product_rgba = Image.open(io.BytesIO(remove(file_bytes))).convert("RGBA")

    # 2) 마스크 생성 (제품은 검정, 배경은 흰색)
    mask = Image.new("L", product_rgba.size, 255)  # 기본은 흰색(수정 영역)
    # rembg 결과의 알파 채널을 이용해 제품 부분만 검정으로 표시
    mask.paste(0, mask=product_rgba.split()[-1])

    # 3) 인페인팅으로 배경 생성 (상황+톤을 프롬프트에 반영)
    prompt = f"{context}, {tone} 분위기, 광고 배경"
    bg = generate_inpainted_background(product=product_rgba, mask=mask, prompt=prompt, size="512x512", use_sdxl=False)

    # 4) 합성 (제품을 배경 위에 다시 올림)
    composed = composite_product_on_bg(product_rgba, bg)

    # 5) 텍스트 삽입
    composed = add_text_overlay(composed, text_overlay or f"{menu} - 오늘의 추천 메뉴", tone)

    # 6) 업스케일
    composed_up = upscale_image(composed, scale=2)

    # 7) 결과 base64 인코딩
    buf = io.BytesIO()
    composed_up.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return b64
