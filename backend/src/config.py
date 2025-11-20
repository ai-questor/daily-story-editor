import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 모델 선택
SD_MODEL = os.getenv("SD_MODEL", "stabilityai/stable-diffusion-2-1")
SDXL_MODEL = os.getenv("SDXL_MODEL", "stabilityai/stable-diffusion-xl-base-1.0")

# 인페인팅 모델 (배경 지우고 다시 칠하기용)
SD_INPAINT_MODEL = os.getenv("SD_INPAINT_MODEL", "stabilityai/stable-diffusion-2-inpainting")
SDXL_INPAINT_MODEL = os.getenv("SDXL_INPAINT_MODEL", "diffusers/stable-diffusion-xl-1.0-inpainting-0.1")  # XL 인페인팅 버전이 따로 있으면 교체 가능

# 업스케일 배율 (2, 3, 4)
UPSCALE_FACTOR = int(os.getenv("UPSCALE_FACTOR", "2"))

# 배경 생성 해상도
BG_SIZE = os.getenv("BG_SIZE", "768x768")  # "512x512" 또는 "768x768"

# OpenAI 키 등 다른 키도 여기에
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
