def build_korean_prompt(menu: str, context: str, tone: str, channel: str) -> str:

    # 메뉴 → 장소 매핑
    if any(word in menu for word in ["커피", "차", "음료"]):
        place = "아늑한 카페 내부"
    elif any(word in menu for word in ["밥", "국", "찌개"]):
        place = "현실적인 한식당 내부"
    elif any(word in menu for word in ["우동", "라멘", "스시"]):
        place = "정통적인 일식당 내부"
    elif any(word in menu for word in ["피자", "파스타"]):
        place = "서양식 레스토랑 내부"
    elif any(word in menu for word in ["치킨", "버거"]):
        place = "패스트푸드점 내부"
    elif any(word in menu for word in ["디저트", "케이크"]):
        place = "디저트 카페 내부"
    else:
        place = "현실적인 식당이나 매장 내부"

    # tone 매핑
    tone_map = {
        "따뜻함": "따뜻하고 아늑한 분위기",
        "유머": "재미있고 유쾌한 분위기",
        "프리미엄": "고급스럽고 세련된 분위기",
        "담백": "깔끔하고 단순한 분위기"
    }
    tone_desc = tone_map.get(tone, tone)

    # channel 매핑
    channel_map = {
        "피드": "현실적인 사진 스타일, SNS 피드용",
        "스토리": "세로형 구도, 눈에 띄는 색감"
    }
    channel_desc = channel_map.get(channel, "")

    # 프롬프트 조합 (context는 그대로 포함)
    prompt = f"{place}, {context}, {tone_desc}, {channel_desc}, 실제 촬영한 듯한 배경"

    return prompt
