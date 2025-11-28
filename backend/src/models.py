from pydantic import BaseModel
from typing import List, Optional

class GeneratePayload(BaseModel):
    menu: str
    context: str
    tone: str
    channel: str
    required_words: Optional[List[str]] = []
    banned_words: Optional[List[str]] = []

class GenerateResult(BaseModel):
    captions: List[str]
    one_liner: str
    hashtags: List[str]

class FactorResult(BaseModel):
    score: int
    explanation: str

class EvaluationResult(BaseModel):
    overall_score: int
    factors: dict[str, FactorResult]
    summary: str
    recommendations: GenerateResult

class EvaluationPayload(BaseModel):
    caption: str
    one_liner: str | None = None
    hashtags: list[str] = []

class BannerResult(BaseModel):
    image_base64: str  # 최종 광고 배너 이미지 (base64 인코딩)