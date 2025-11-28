import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from models import EvaluationPayload, EvaluationResult, FactorResult, GenerateResult
from config import OPENAI_API_KEY

# LangChain ChatOpenAI 초기화
llm = ChatOpenAI(model="gpt-5-nano", api_key=OPENAI_API_KEY)

def evaluate_content(payload: EvaluationPayload) -> EvaluationResult:
    # 프롬프트 템플릿 정의
    prompt = ChatPromptTemplate.from_messages([
        ("system", "너는 인스타그램 마케팅 전문가다."),
        ("user", """캡션: {caption}
한 줄 광고: {one_liner}
해시태그: {hashtags}

위 문구를 다면적으로 평가해줘.

평가 항목 (각 항목은 1~10점과 설명을 제공):
1. 참여도(Engagement) - 질문형 문구, 이모지, 댓글 유도 등
2. 브랜드 일관성(Brand Consistency) - 브랜드 가치와 톤의 일관성
3. 감성 어필(Emotional Appeal) - 감정적 단어, 스토리텔링 요소
4. 해시태그 전략(Hashtag Strategy) - 지역성, 시즌성, 브랜드 고유 태그 활용
5. 간결성(Clarity) - 메시지의 직관성과 압축성
6. 행동 유도성(Call-to-Action) - 구매, 방문, 팔로우 등 구체적 행동 유도
7. 차별성(Differentiation) - 경쟁 브랜드와의 차별화, 독창성
8. 트렌드 적합성(Trend Fit) - 시즌, 문화, 최신 트렌드 반영

각 항목별 점수와 설명을 주고,
마지막에 종합 점수(1~10)와 총평을 작성해.

그리고 평가를 바탕으로 개선된 추천 샘플을 제시해:
- captions: 개선된 인스타그램 캡션 3개 (위 항목들을 모두 고려하여 9점 이상을 목표로 작성)
- one_liner: 개선된 한 줄 광고 1개
- hashtags: 개선된 해시태그 5개 (지역성, 시즌성, 브랜드 고유 태그 포함)

출력은 반드시 순수 JSON 형식으로만:
{{
  "overall_score": <int>,
  "factors": {{
    "engagement": {{ "score": <int>, "explanation": "<string>" }},
    "brand_consistency": {{ "score": <int>, "explanation": "<string>" }},
    "emotional_appeal": {{ "score": <int>, "explanation": "<string>" }},
    "hashtags": {{ "score": <int>, "explanation": "<string>" }},
    "clarity": {{ "score": <int>, "explanation": "<string>" }},
    "call_to_action": {{ "score": <int>, "explanation": "<string>" }},
    "differentiation": {{ "score": <int>, "explanation": "<string>" }},
    "trend_fit": {{ "score": <int>, "explanation": "<string>" }}
  }},
  "summary": "<string>",
  "recommendations": {{
    "captions": ["...", "...", "..."],
    "one_liner": "...",
    "hashtags": ["...", "...", "...", "...", "..."]
  }}
}}
""")
    ])

    # 변수 바인딩
    variables = {
        "caption": payload.caption,
        "one_liner": payload.one_liner or "",
        "hashtags": ", ".join(payload.hashtags or []),
    }

    try:
        response = (prompt | llm).invoke(variables)
        print("✅ 모델 응답:", response.content)

        data = json.loads(response.content.strip())

        return EvaluationResult(
            overall_score=data.get("overall_score", 0),
            factors={
                k: FactorResult(score=v.get("score", 0), explanation=v.get("explanation", ""))
                for k, v in data.get("factors", {}).items()
            },
            summary=data.get("summary", ""),
            recommendations=GenerateResult(
                captions=data.get("recommendations", {}).get("captions", []),
                one_liner=data.get("recommendations", {}).get("one_liner", ""),
                hashtags=data.get("recommendations", {}).get("hashtags", [])
            )
        )
    except Exception as e:
        print("❌ 에러 발생:", str(e))
        return EvaluationResult(
            overall_score=0,
            factors={},
            summary=f"오류 발생: {str(e)} | 원본 응답: {getattr(response, 'content', '')}",
            recommendations=GenerateResult(captions=[], one_liner="", hashtags=[])
        )
