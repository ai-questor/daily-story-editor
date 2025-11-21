# pipeline/upscaler.py
import os
import requests
import torch
import numpy as np
from PIL import Image
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet  # RRDBNet 아키텍처

DEFAULT_URL = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"

class RealESRGANUpscaler:
    def __init__(self, device=None, scale=4,
                 weights_path="weights/RealESRGAN_x4plus.pth"):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.scale = scale
        os.makedirs(os.path.dirname(weights_path), exist_ok=True)

        # 가중치 없으면 자동 다운로드
        if not os.path.exists(weights_path):
            print("Real-ESRGAN weight 파일이 없습니다. 자동 다운로드를 시작합니다...")
            r = requests.get(DEFAULT_URL, stream=True)
            r.raise_for_status()
            with open(weights_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            print(f"다운로드 완료: {weights_path}")

        # RRDBNet 아키텍처 정의 (RealESRGAN_x4plus 기본 설정)
        rrdbnet = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=4
        )

        # RealESRGANer 초기화
        self.model = RealESRGANer(
            scale=self.scale,
            model_path=weights_path,
            dni_weight=None,
            model=rrdbnet,
            device=self.device,
            half=True
        )

    def enhance(self, img: Image.Image, outscale: int = None) -> Image.Image:
        sr_img, _ = self.model.enhance(np.array(img), outscale=self.scale)
        pil = Image.fromarray(sr_img)

        if outscale and outscale != self.scale:
            w, h = pil.size
            pil = pil.resize(
                (int(w * outscale / self.scale), int(h * outscale / self.scale)),
                Image.LANCZOS
            )
        return pil

# 전역 인스턴스
_realesrgan = RealESRGANUpscaler()

def upscale_image(img: Image.Image, scale: int = 2) -> Image.Image:
    """
    Real-ESRGAN 기반 업스케일링. 기본 x4 모델을 사용하며,
    scale 인자는 후처리 리사이즈로 맞춥니다.
    """
    return _realesrgan.enhance(img, outscale=scale)
