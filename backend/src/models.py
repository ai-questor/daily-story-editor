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
