# services/persona_evaluation.py
import json
import sys
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from models import (
    PersonaEvaluationPayload,
    PersonaEvaluationResponse,
    PersonaEvaluationResult,
    PersonaEvaluationFeedback,
    PersonaBreakdownItem,
)
from config import OPENAI_API_KEY

# 싱글턴 LLM 객체
llm = ChatOpenAI(model="gpt-5-nano", api_key=OPENAI_API_KEY)

def evaluate_personas(payload: PersonaEvaluationPayload) -> PersonaEvaluationResponse:
    # 모든 페르소나를 한 번에 프롬프트에 포함
    personas_text = "\n".join([
        f"- {p.id}: {p.name} ({p.description}), weights={p.weights}"
        for p in payload.selectedPersonas
    ])

    prompt = ChatPromptTemplate.from_messages([
        ("system", "너는 인스타그램 마케팅 전문가이며, 여러 페르소나 관점에서 광고 문구를 평가한다."),
        ("user", """선택된 페르소나들:
{personas_text}

캡션: {caption}
원라이너: {one_liner}
해시태그: {hashtags}

각 페르소나별로 아래 JSON 형식의 평가 결과를 배열로 반환해줘:

{{
  "results": [
    {{
      "personaId": "<string>",
      "personaName": "<string>",
      "overall_score": <int>,
      "feedback": "<string>",
      "captionFeedback": {{ "score": <int>, "comment": "<string>" }},
      "oneLinerFeedback": {{ "score": <int>, "comment": "<string>" }},
      "hashtagsFeedback": {{ "score": <int>, "comment": "<string>" }},
      "breakdown": {{
        "emotion": {{ "score": <int>, "reason": "<string>" }},
        "offer": {{ "score": <int>, "reason": "<string>" }},
        "cta": {{ "score": <int>, "reason": "<string>" }},
        "local": {{ "score": <int>, "reason": "<string>" }},
        "trend": {{ "score": <int>, "reason": "<string>" }}
      }}
    }}
  ],
  "summary": {{
    "bestPersonaId": "<string>",
    "averageScore": <int>,
    "notes": ["<string>", "<string>", ...]
  }}
}}
""")
    ])

    variables = {
        "personas_text": personas_text,
        "caption": payload.caption,
        "one_liner": payload.one_liner or "",
        "hashtags": ", ".join(payload.hashtags or []),
    }

    try:
        # ✅ 디버그 출력
        print("=== Prompt input_variables ===", file=sys.stderr)
        print(prompt.input_variables, file=sys.stderr)

        messages = prompt.format_messages(**variables)
        print("=== Rendered messages ===", file=sys.stderr)
        for i, m in enumerate(messages):
            print(f"[{i}] role={getattr(m, 'type', 'unk')} content:\n{m.content}\n", file=sys.stderr)

        # LLM 단일 호출
        response = (prompt | llm).invoke(variables)
        print("=== Raw LLM Response ===", file=sys.stderr)
        print(response.content, file=sys.stderr)

        data = json.loads(response.content.strip())

        results = []
        for r in data.get("results", []):
            results.append(
                PersonaEvaluationResult(
                    personaId=r.get("personaId", ""),
                    personaName=r.get("personaName", ""),
                    overall_score=r.get("overall_score", 0),
                    feedback=r.get("feedback", ""),
                    captionFeedback=PersonaEvaluationFeedback(
                        score=r.get("captionFeedback", {}).get("score", 0),
                        comment=r.get("captionFeedback", {}).get("comment", "")
                    ),
                    oneLinerFeedback=PersonaEvaluationFeedback(
                        score=r.get("oneLinerFeedback", {}).get("score", 0),
                        comment=r.get("oneLinerFeedback", {}).get("comment", "")
                    ),
                    hashtagsFeedback=PersonaEvaluationFeedback(
                        score=r.get("hashtagsFeedback", {}).get("score", 0),
                        comment=r.get("hashtagsFeedback", {}).get("comment", "")
                    ),
                    breakdown={
                        k: PersonaBreakdownItem(score=v.get("score", 0), reason=v.get("reason", ""))
                        for k, v in r.get("breakdown", {}).items()
                    }
                )
            )

        summary = data.get("summary", {})

        return PersonaEvaluationResponse(results=results, summary=summary)

    except Exception as e:
        print(f"❌ LLM 평가 중 오류 발생: {str(e)}", file=sys.stderr)
        raise e
