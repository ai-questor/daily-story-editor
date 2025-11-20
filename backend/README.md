# daily-story-editor

### 환경설정
```
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
uv python install 3.12
uv init -p 3.12 --bare
uv add fastapi uvicorn[standard] langchain langchain-openai pydantic
uv add dotenv 
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