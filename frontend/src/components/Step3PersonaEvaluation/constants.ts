import type { Persona } from "./types"

export const DEFAULT_PERSONAS: Persona[] = [
  { id: "student", name: "대학생", description: "20대 / 재미·SNS 공유 / 가격 민감, 유행 선호", weights: { emotion: 7, offer: 9, cta: 8, local: 4, trend: 9 } },
  { id: "office", name: "직장인", description: "30대 / 편의성·스트레스 해소 / 브랜드 신뢰, 효율성", weights: { emotion: 6, offer: 7, cta: 9, local: 5, trend: 6 } },
  { id: "parent", name: "부모", description: "40대 / 가족 만족·아이 경험 / 실용성, 안전성", weights: { emotion: 5, offer: 8, cta: 7, local: 6, trend: 4 } },
  { id: "senior", name: "시니어", description: "60대 / 건강·안정성 / 전통·신뢰", weights: { emotion: 4, offer: 6, cta: 5, local: 8, trend: 3 } },
  { id: "trend", name: "트렌드 리더", description: "20~30대 / 유행·차별화 / 감성·스타일", weights: { emotion: 9, offer: 7, cta: 8, local: 4, trend: 10 } },
  { id: "local", name: "지역 주민", description: "전주 거주 / 로컬 애착 / 지역성·공동체", weights: { emotion: 5, offer: 6, cta: 6, local: 10, trend: 4 } },
  { id: "traveler", name: "여행객", description: "타지 방문 / 체험·추억 / 독창성·사진", weights: { emotion: 7, offer: 6, cta: 7, local: 8, trend: 8 } },
  { id: "online", name: "온라인 쇼핑족", description: "편리성·가격 / 가성비·즉시성", weights: { emotion: 4, offer: 9, cta: 9, local: 3, trend: 6 } },
  { id: "affective", name: "감성 소비자", description: "감정적 만족 / 스토리·분위기", weights: { emotion: 10, offer: 5, cta: 7, local: 4, trend: 7 } },
  { id: "practical", name: "실용 소비자", description: "필요 충족 / 합리성·가성비", weights: { emotion: 3, offer: 9, cta: 8, local: 5, trend: 3 } },
];