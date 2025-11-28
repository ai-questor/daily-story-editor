# services/persona_evaluation.py
from models import PersonaEvaluationPayload, PersonaEvaluationResponse, PersonaEvaluationResult, PersonaEvaluationFeedback, PersonaBreakdownItem

def evaluate_personas(payload: PersonaEvaluationPayload) -> PersonaEvaluationResponse:
    results = []

    for p in payload.selectedPersonas:
        # 간단한 점수 계산 로직 (Mock)
        caption_score = 78
        one_liner_score = 85
        hashtags_score = 70
        overall = round((caption_score + one_liner_score + hashtags_score) / 3)

        breakdown = {
            "emotion": PersonaBreakdownItem(score=82, reason="감성 키워드가 포함되어 있음"),
            "offer": PersonaBreakdownItem(score=74, reason="직접적인 할인 키워드는 부족"),
            "cta": PersonaBreakdownItem(score=68, reason="즉각적 행동 유도 문구가 부족"),
            "local": PersonaBreakdownItem(score=40, reason="지역성 키워드가 적음"),
            "trend": PersonaBreakdownItem(score=88, reason="SNS/트렌드 키워드가 잘 반영됨"),
        }

        result = PersonaEvaluationResult(
            personaId=p.id,
            personaName=p.name,
            overall_score=overall,
            feedback=f"{p.name} 페르소나와의 적합도는 {overall}점입니다.",
            captionFeedback=PersonaEvaluationFeedback(score=caption_score, comment="캡션의 감성 표현이 강점입니다."),
            oneLinerFeedback=PersonaEvaluationFeedback(score=one_liner_score, comment="원라이너의 감성 임팩트가 좋습니다."),
            hashtagsFeedback=PersonaEvaluationFeedback(score=hashtags_score, comment="해시태그가 트렌드와 SNS 공유 맥락에 적합합니다."),
            breakdown=breakdown
        )
        results.append(result)

    summary = {
        "bestPersonaId": results[0].personaId if results else None,
        "averageScore": round(sum(r.overall_score for r in results) / len(results)) if results else 0,
        "notes": ["CTA와 지역성 요소를 보강하면 더 완벽한 결과를 얻을 수 있습니다."]
    }

    return PersonaEvaluationResponse(results=results, summary=summary)
