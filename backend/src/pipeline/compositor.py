# pipeline/compositor.py
from PIL import Image, ImageDraw, ImageFont
from typing import Optional


def add_text_overlay(img: Image.Image, text: Optional[str], tone: Optional[str] = None) -> Image.Image:
    if not text:
        return img
    draw = ImageDraw.Draw(img)
    # 폰트 준비 (assets 폴더에 NotoSansKR 등 준비 권장)
    try:
        font = ImageFont.truetype("assets/fonts/NotoSansCJK-Regular.ttc", size=int(img.height * 0.06))
    except:
        print('Default font will be used..')
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
