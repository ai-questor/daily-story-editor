# pipeline/upscaler.py
from PIL import Image
import numpy as np

# 간단한 래퍼: 실제 realesrgan 라이브러리의 추론 코드를 호출
# 구현 시 설치된 realesrgan 버전에 맞춘 import 필요합니다.
def upscale_image(img: Image.Image, scale: int = 2) -> Image.Image:
    # 데모용: Pillow resize (실서비스에서는 Real-ESRGAN으로 대체)
    w, h = img.size
    return img.resize((w*scale, h*scale), Image.LANCZOS)
