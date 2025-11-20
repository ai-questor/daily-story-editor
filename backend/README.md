# daily-story-editor

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
