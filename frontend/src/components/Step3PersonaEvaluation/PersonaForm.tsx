import React from "react";
import type { Persona } from "./types";
import SliderInput from "./SliderInput";

interface Props {
  newPersona: Persona;
  setNewPersona: (p: Persona) => void;
  onAdd: () => void;
}

export default function PersonaForm({ newPersona, setNewPersona, onAdd }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ✅ 폼 기본 제출 막기
    onAdd();
  };

  return (
    <div className="card border-success">
      <div className="card-body">
        <h5 className="card-title">새로운 페르소나 추가</h5>

        <form onSubmit={handleSubmit}>
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

          <SliderInput
            label="감성"
            description="감정적인 표현 강조"
            value={newPersona.weights.emotion}
            onChange={(val) =>
              setNewPersona({ ...newPersona, weights: { ...newPersona.weights, emotion: val } })
            }
          />
          <SliderInput
            label="오퍼"
            description="할인·혜택 강조"
            value={newPersona.weights.offer}
            onChange={(val) =>
              setNewPersona({ ...newPersona, weights: { ...newPersona.weights, offer: val } })
            }
          />
          <SliderInput
            label="CTA"
            description="행동 유도 문구 강조"
            value={newPersona.weights.cta}
            onChange={(val) =>
              setNewPersona({ ...newPersona, weights: { ...newPersona.weights, cta: val } })
            }
          />
          <SliderInput
            label="로컬"
            description="지역성 강조"
            value={newPersona.weights.local}
            onChange={(val) =>
              setNewPersona({ ...newPersona, weights: { ...newPersona.weights, local: val } })
            }
          />
          <SliderInput
            label="트렌드"
            description="최신 유행 반영"
            value={newPersona.weights.trend}
            onChange={(val) =>
              setNewPersona({ ...newPersona, weights: { ...newPersona.weights, trend: val } })
            }
          />

            <button
                type="button"
                className="btn btn-success w-100 mt-2"
                onClick={onAdd}
                disabled={!newPersona.name.trim() || !newPersona.description.trim()} // 둘 다 있어야 활성화
                >
                ➕ 추가하기
            </button>

            {(!newPersona.name.trim() || !newPersona.description.trim()) && (
                <div className="alert alert-warning mt-2">
                    이름과 설명을 모두 입력해야 합니다.
                </div>
            )}
        </form>
      </div>
    </div>
  );
}
