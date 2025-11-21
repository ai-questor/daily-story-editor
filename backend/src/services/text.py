import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from models import GeneratePayload, GenerateResult
from config import OPENAI_API_KEY

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, api_key=OPENAI_API_KEY)

def generate_text(payload: GeneratePayload) -> GenerateResult:
    prompt = ChatPromptTemplate.from_messages([
        ("system", "너는 SNS 마케팅 문구를 작성하는 카피라이터다."),
        ("user", """메뉴: {menu}
상황: {context}
톤: {tone}
채널: {channel}
필수 단어: {required_words}
금지 단어: {banned_words}

위 조건에 맞는 SNS 문구를 생성해줘.

- 채널이 '피드'일 경우:
  * 브랜드 대표성을 강조하고 설명을 풍부하게 작성
  * 장기간 남아 브랜드 자산이 되므로 정돈된 톤 유지
  * 대표 메뉴와 광고성 컨텐츠에 적합

- 채널이 '스토리'일 경우:
  * 짧고 임팩트 있게, 오늘의 순간을 담아라
  * 친근한 톤과 이모지 활용
  * 매일 올려도 부담 없는 즉흥적 컨텐츠에 적합

위 조건에 맞는 SNS 캡션 3개, 한 줄 광고 1개, 해시태그 5개를 **순수 JSON 형식으로만** 생성해줘.
반드시 JSON만 반환하고, 코드 블록(````json`)이나 설명 문구는 절대 붙이지 마.

출력 형식:
{{
  "captions": ["...", "...", "..."],
  "one_liner": "...",
  "hashtags": ["...", "...", "...", "...", "..."]
}}
""")
    ])

    # 바인딩할 변수 딕셔너리 준비
    variables = {
        "menu": payload.menu,
        "context": payload.context,
        "tone": payload.tone,
        "channel": payload.channel,
        "required_words": ", ".join(payload.required_words or []),
        "banned_words": ", ".join(payload.banned_words or []),
    }

    # 변수 딕셔너리 출력
    print("👉 바인딩된 변수들:", variables)

    # 최종 프롬프트 출력
    formatted_prompt = prompt.format(**variables)
    print("👉 최종 프롬프트:", formatted_prompt)

    # 모델 호출
    try:
        response = (prompt | llm).invoke(variables)
        print("✅ 모델 응답:", response.content)

        data = json.loads(response.content.strip())
        return GenerateResult(
            captions=data.get("captions", []),
            one_liner=data.get("one_liner", ""),
            hashtags=data.get("hashtags", [])
        )
    except Exception as e:
        print("❌ 에러 발생:", str(e))
        return GenerateResult(
            captions=[],
            one_liner=f"오류 발생: {str(e)} | 원본 응답: {getattr(response, 'content', '')}",
            hashtags=[]
        )
