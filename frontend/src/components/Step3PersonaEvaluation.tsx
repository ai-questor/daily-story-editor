import React, { useState } from "react";

type Persona = {
  id: string;
  name: string;
  description: string;
  weights: {
    emotion: number;
    offer: number;
    cta: number;
    local: number;
    trend: number;
  };
};

const DEFAULT_PERSONAS: Persona[] = [
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

interface Props {
  selectedPersonas: string[];
  setSelectedPersonas: (ids: string[]) => void;
  onEvaluate: () => void;
}

export default function Step3PersonaEvaluation({
  selectedPersonas,
  setSelectedPersonas,
  onEvaluate,
}: Props) {
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [newPersona, setNewPersona] = useState<Persona>({
    id: "new",
    name: "",
    description: "",
    weights: { emotion: 5, offer: 5, cta: 5, local: 5, trend: 5 },
  });

  const togglePersona = (id: string) => {
    if (selectedPersonas.includes(id)) {
      setSelectedPersonas(selectedPersonas.filter(p => p !== id));
    } else {
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  const handleSaveEdit = () => {
    if (!editingPersona) return;
    setPersonas(personas.map(p => (p.id === editingPersona.id ? editingPersona : p)));
    setEditingPersona(null);
  };

  const handleAddPersona = () => {
    if (!newPersona.name) return;
    setPersonas([...personas, { ...newPersona, id: `custom-${Date.now()}` }]);
    setNewPersona({
      id: "new",
      name: "",
      description: "",
      weights: { emotion: 5, offer: 5, cta: 5, local: 5, trend: 5 },
    });
  };

  const renderSlider = (label: string, value: number, onChange: (val: number) => void) => (
    <div className="mb-2">
      <label className="form-label">{label}: {value}</label>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        className="form-range"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );

  return (
    <div className="card p-4 shadow-sm mt-3">
      <h2 className="h5 mb-3">Step 3: 페르소나 기반 광고문구 평가</h2>

      <div className="row">
        {personas.map(p => (
          <div key={p.id} className="col-md-6 mb-3">
            <div className={`card ${selectedPersonas.includes(p.id) ? "border-primary" : ""}`}>
              <div className="card-body">
                {editingPersona?.id === p.id ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={editingPersona.name}
                      onChange={(e) => setEditingPersona({ ...editingPersona, name: e.target.value })}
                    />
                    <textarea
                      className="form-control mb-2"
                      value={editingPersona.description}
                      onChange={(e) => setEditingPersona({ ...editingPersona, description: e.target.value })}
                    />
                    {renderSlider("감성", editingPersona.weights.emotion, val => setEditingPersona({ ...editingPersona, weights: { ...editingPersona.weights, emotion: val } }))}
                    {renderSlider("오퍼", editingPersona.weights.offer, val => setEditingPersona({ ...editingPersona, weights: { ...editingPersona.weights, offer: val } }))}
                    {renderSlider("CTA", editingPersona.weights.cta, val => setEditingPersona({ ...editingPersona, weights: { ...editingPersona.weights, cta: val } }))}
                    {renderSlider("로컬", editingPersona.weights.local, val => setEditingPersona({ ...editingPersona, weights: { ...editingPersona.weights, local: val } }))}
                    {renderSlider("트렌드", editingPersona.weights.trend, val => setEditingPersona({ ...editingPersona, weights: { ...editingPersona.weights, trend: val } }))}
                    <button className="btn btn-primary me-2" onClick={handleSaveEdit}>
                      저장
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingPersona(null)}>
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <h5 className="card-title">{p.name}</h5>
                    <p className="card-text">{p.description}</p>
                    <ul className="list-unstyled small text-muted">
                      <li>감성: {p.weights.emotion}</li>
                      <li>오퍼: {p.weights.offer}</li>
                      <li>CTA: {p.weights.cta}</li>
                      <li>로컬: {p.weights.local}</li>
                      <li>트렌드: {p.weights.trend}</li>
                    </ul>
                    <div className="d-flex gap-2">
                      <button
                        className={`btn btn-sm ${selectedPersonas.includes(p.id) ? "btn-danger" : "btn-outline-primary"}`}
                        onClick={() => togglePersona(p.id)}
                      >
                        {selectedPersonas.includes(p.id) ? "선택 해제" : "선택"}
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => setEditingPersona(p)}
                      >
                        수정
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 커스텀 페르소나 추가 카드 */}
        <div className="col-md-6 mb-3">
          <div className="card border-success">
            <div className="card-body">
              <h5 className="card-title">새로운 페르소나 추가</h5>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="이름 (예: 20대 여성 고객)"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
              />
              <textarea
                className="form-control mb-2"
                placeholder="설명 (예: 카페·디저트 선호, SNS 후기 중시)"
                value={newPersona.description}
                onChange={(e) => setNewPersona({ ...newPersona, description: e.target.value })}
              />
              {renderSlider("감성", newPersona.weights.emotion, val => setNewPersona({ ...newPersona, weights: { ...newPersona.weights, emotion: val } }))}
              {renderSlider("오퍼", newPersona.weights.offer, val => setNewPersona({ ...newPersona, weights: { ...newPersona.weights, offer: val } }))}
              {renderSlider("CTA", newPersona.weights.cta, val => setNewPersona({ ...newPersona, weights: { ...newPersona.weights, cta: val } }))}
              {renderSlider("로컬", newPersona.weights.local, val => setNewPersona({ ...newPersona, weights: { ...newPersona.weights, local: val } }))}
              {renderSlider("트렌드", newPersona.weights.trend, val => setNewPersona({ ...newPersona, weights: { ...newPersona.weights, trend: val } }))}
              <button className="btn btn-success mt-2" onClick={handleAddPersona}>
                추가하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary w-100 mt-3" onClick={onEvaluate}>
        선택한 페르소나로 평가하기
      </button>
    </div>
  );
}