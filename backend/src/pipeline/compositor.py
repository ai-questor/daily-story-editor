# pipeline/compositor.py
from PIL import Image, ImageDraw, ImageFont
from typing import Optional

def composite_product_on_bg(product_rgba: Image.Image, background_rgb: Image.Image) -> Image.Image:
    bg = background_rgb.copy()
    # 제품 크기 조정 (배경의 50~70% 폭 정도)
    target_w = int(bg.width * 0.6)
    scale = target_w / product_rgba.width
    new_size = (int(product_rgba.width * scale), int(product_rgba.height * scale))
    product_resized = product_rgba.resize(new_size, Image.LANCZOS)

    # 중앙 배치
    x = (bg.width - product_resized.width) // 2
    y = (bg.height - product_resized.height) // 2
    bg.paste(product_resized, (x, y), product_resized)
    return bg

def add_text_overlay(img: Image.Image, text: Optional[str], tone: Optional[str] = None) -> Image.Image:
    if not text:
        return img
    draw = ImageDraw.Draw(img)
    # 폰트 준비 (assets 폴더에 NotoSansKR 등 준비 권장)
    try:
        font = ImageFont.truetype("assets/NotoSansKR-Bold.otf", size=int(img.height * 0.06))
    except:
        font = ImageFont.load_default()

    # 톤에 따른 색상 (간단 예시)
    color = (255, 255, 255) if tone in ("프리미엄",) else (20, 20, 20)
    # 텍스트 배경을 위한 반투명 박스
    padding = 24
    text_w, text_h = draw.textbbox((0,0), text, font=font)[2:]
    box_w = text_w + padding*2
    box_h = text_h + padding*2

    box = Image.new("RGBA", (box_w, box_h), (0, 0, 0, 120)) if color == (255,255,255) else Image.new("RGBA", (box_w, box_h), (255, 255, 255, 160))

    # 좌하단 배치
    x = padding
    y = img.height - box_h - padding
    img.paste(box, (x, y), box)
    draw.text((x + padding, y + padding), text, font=font, fill=color)
    return img
