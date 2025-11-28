import React from "react";
import type { Persona } from "./types";
import SliderInput from "./SliderInput";

interface Props {
  persona: Persona;
  selected: boolean;
  editing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onSave: (p: Persona) => void;
  onCancel: () => void;
}

export default function PersonaCard({ persona, selected, editing, onToggle, onEdit, onSave, onCancel }: Props) {
  const [draft, setDraft] = React.useState<Persona>(persona);

  React.useEffect(() => {
    if (editing) setDraft(persona);
  }, [editing, persona]);

  const handleSave = () => {
    if (!draft.name.trim() || !draft.description.trim()) {
      alert("⚠️ 이름과 설명을 모두 입력해야 저장할 수 있습니다.");
      return;
    }
    onSave(draft);
  };

  if (editing) {
    return (
      <div className="card border-warning">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-2"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <textarea
            className="form-control mb-2"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
          <SliderInput label="감성" description="감정적인 표현 강조" value={draft.weights.emotion} onChange={(val) => setDraft({ ...draft, weights: { ...draft.weights, emotion: val } })} />
          <SliderInput label="오퍼" description="할인·혜택 강조" value={draft.weights.offer} onChange={(val) => setDraft({ ...draft, weights: { ...draft.weights, offer: val } })} />
          <SliderInput label="CTA" description="행동 유도 문구 강조" value={draft.weights.cta} onChange={(val) => setDraft({ ...draft, weights: { ...draft.weights, cta: val } })} />
          <SliderInput label="로컬" description="지역성 강조" value={draft.weights.local} onChange={(val) => setDraft({ ...draft, weights: { ...draft.weights, local: val } })} />
          <SliderInput label="트렌드" description="최신 유행 반영" value={draft.weights.trend} onChange={(val) => setDraft({ ...draft, weights: { ...draft.weights, trend: val } })} />

          <div className="d-flex flex-column gap-2 mt-3">
            <button className="btn btn-primary w-100" onClick={() => handleSave()}>💾 저장</button>
            <button className="btn btn-secondary w-100" onClick={onCancel}>❌ 취소</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${selected ? "border-primary" : ""}`}>
      <div className="card-body">
        <h5 className="card-title">{persona.name}</h5>
        <p className="card-text">{persona.description}</p>
        <ul className="list-unstyled small text-muted">
          <li>감성: {persona.weights.emotion}</li>
          <li>오퍼: {persona.weights.offer}</li>
          <li>CTA: {persona.weights.cta}</li>
          <li>로컬: {persona.weights.local}</li>
          <li>트렌드: {persona.weights.trend}</li>
        </ul>
        <div className="d-flex flex-column gap-2 mt-2">
          <button
            className={`btn w-100 ${selected ? "btn-secondary" : "btn-primary"}`}
            onClick={onToggle}
          >
            {selected ? "❌ 선택 해제" : "✅ 선택"}
          </button>
          <button className="btn btn-secondary w-100" onClick={onEdit}>✏️ 수정</button>
        </div>
      </div>
    </div>
  );
}
