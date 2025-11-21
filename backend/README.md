# daily-story-editor

### Nvidia GPU관련 환경설정
```
sudo apt-get --purge remove '*nvidia*'
sudo apt-get autoremove -y
sudo apt-get clean

sudo apt-get update
sudo apt-get install nvidia-driver
sudo reboot

uname -r        # 커널이 여전히 generic인지 확인
nvidia-smi      # GPU 상태 확인
lsmod | grep nvidia

sudo nano /etc/apt/sources.list
deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
deb http://deb.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware

sudo apt-get update
sudo apt-get install nvidia-driver firmware-misc-nonfree
sudo reboot

nvcc --version
nvidia-smi
```

### 환경설정
```
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
uv python install 3.12
uv init -p 3.12 --bare
uv add fastapi python-multipart uvicorn[standard] pydantic dotenv 

# 랭체인
uv add langchain langchain-openai 

# 이미지 처리
uv add pillow numpy

# 배경 제거 (U2Net 기반)
uv add rembg onnxruntime-gpu

# Stable Diffusion (배경 생성)
uv add diffusers transformers accelerate safetensors torch

# 업스케일러 (Real-ESRGAN)
uv add realesrgan

# SAM 설치
uv pip install git+https://github.com/facebookresearch/segment-anything.git
uv pip install opencv-python pillow torch torchvision
  - download checkpoint: wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth -P weights
    - sam_vit_b_01ec64.pth (ViT-B, 더 가볍고 빠름)
    - sam_vit_l_0b3195.pth (ViT-L, 중간 크기)

# 구글 번역
uv add deep-translator

uv sync
```

### 서버 실행
```bash
cd src
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### API 문서 확인
- Swagger UI: http://127.0.0.1:8080/docs
- ReDoc: http://127.0.0.1:8080/redoc


### 샘플 요청
curl -X POST "http://localhost:8080/api/generate-banner" \
  -F "file=@/home/yjy/daily-story-editor/backend/kimchi-product.webp" \
  -F "menu=따뜻한 커피" \
  -F "context=눈이 내리는 크리스마스" \
  -F "tone=따뜻함" \
  -F "channel=피드" \
  -F "required_words=수제" \
  -F "banned_words=완벽" \
  -F "text_overlay=따뜻한 커피 - 오늘의 추천 메뉴"
