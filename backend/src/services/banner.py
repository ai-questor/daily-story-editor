import io, base64
from PIL import Image
from rembg import remove
from pipeline.diffusion import generate_inpainted_background
from pipeline.upscaler import upscale_image
from pipeline.compositor import add_text_overlay
from pipeline.utils import resize_with_padding, prepare_inpainting_inputs

def generate_banner(file_bytes: bytes, menu: str, context: str, tone: str,
                    channel: str, required_words: str, banned_words: str,
                    text_overlay: str) -> str:
    print('1) 배경 제거 → 제품만 남기기')
    product_rgba = Image.open(io.BytesIO(remove(file_bytes))).convert("RGBA")

    print('2) 비율 유지 + 패딩')
    product_padded = resize_with_padding(product_rgba, (512,512))

    print('3) 제품 이미지 + 마스크 준비')
    product_resized, mask_resized = prepare_inpainting_inputs(product_padded, target_size=(512, 512), blur_radius=0)

    print('4) 인페인팅으로 배경 생성')
    prompt = f"{context}, {tone} 분위기, 광고 배경"
    bg = generate_inpainted_background(product_resized, mask_resized, prompt, use_sdxl=False)

    print('5) 텍스트 삽입')
    composed = add_text_overlay(bg, text_overlay or f"{menu} - 오늘의 추천 메뉴", tone)

    print('6) 업스케일')
    scale = 2 if channel == "피드" else 3
    composed_up = upscale_image(composed, scale=scale)

    print('7) 결과 base64 인코딩')
    buf = io.BytesIO()
    composed_up.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")
