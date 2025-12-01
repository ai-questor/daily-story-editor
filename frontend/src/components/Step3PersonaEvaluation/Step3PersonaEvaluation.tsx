import React, { useState } from "react";
import { DEFAULT_PERSONAS } from "./constants";
import type { Persona, Props, PersonaEvaluationResponse } from "./types";
import PersonaCard from "./PersonaCard";
import PersonaForm from "./PersonaForm";
import EvaluationResult from "./EvaluationResult";

export default function Step3PersonaEvaluation({
  selectedPersonas,
  setSelectedPersonas,
  caption,
  oneLiner,
  hashtags,
  onEvaluate,
}: Props) {
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [newPersona, setNewPersona] = useState<Persona>({
    id: "new",
    name: "",
    description: "",
    weights: { emotion: 5, offer: 5, cta: 5, local: 5, trend: 5 },
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<PersonaEvaluationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // ✅ 로딩 상태 추가

  const togglePersona = (id: string) => {
    if (selectedPersonas.includes(id)) {
      setSelectedPersonas(selectedPersonas.filter((p) => p !== id));
    } else {
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  const handleAddPersona = () => {
    if (!newPersona.name.trim() || !newPersona.description.trim()) {
      setErrorMessage("⚠️ 이름과 설명을 모두 입력해야 합니다.");
      return;
    }
    setPersonas([...personas, { ...newPersona, id: `custom-${Date.now()}` }]);
    setNewPersona({
      id: "new",
      name: "",
      description: "",
      weights: { emotion: 5, offer: 5, cta: 5, local: 5, trend: 5 },
    });
    setErrorMessage("");
  };

  const handleSaveEdit = (updated: Persona) => {
    if (!updated.name.trim() || !updated.description.trim()) {
      setErrorMessage("⚠️ 이름과 설명을 모두 입력해야 합니다.");
      return;
    }
    setPersonas(personas.map((p) => (p.id === updated.id ? updated : p)));
    setEditingId(null);
    setErrorMessage("");
  };

  const handleEvaluate = async () => {
    if (selectedPersonas.length === 0) {
      setErrorMessage("⚠️ 최소 한 개 이상의 페르소나를 선택해주세요.");
      return;
    }
    setErrorMessage("");
    setLoading(true); // ✅ 로딩 시작

    try {
      const response = await fetch("/api/evaluate-personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPersonas: personas.filter((p) => selectedPersonas.includes(p.id)),
          caption,
          one_liner: oneLiner,
          hashtags,
        }),
      });

      if (!response.ok) throw new Error("API 호출 실패");
      const data: PersonaEvaluationResponse = await response.json();
      setEvaluation(data);
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false); // ✅ 로딩 종료
    }
  };

  return (
    <div className="card p-4 shadow-sm mt-3">
      <h2 className="h5 mb-3">Step 3: 페르소나 기반 광고문구 평가</h2>

      {/* 페르소나 카드들 */}
      <div className="row">
        {personas.map((p) => (
          <div key={p.id} className="col-md-6 mb-3">
            <PersonaCard
              persona={p}
              selected={selectedPersonas.includes(p.id)}
              editing={editingId === p.id}
              onToggle={() => togglePersona(p.id)}
              onEdit={() => setEditingId(p.id)}
              onSave={handleSaveEdit}
              onCancel={() => setEditingId(null)}
            />
          </div>
        ))}

        <div className="col-md-6 mb-3">
          <PersonaForm newPersona={newPersona} setNewPersona={setNewPersona} onAdd={handleAddPersona} errorMessage={errorMessage} />
        </div>
      </div>

      <button className="btn btn-primary w-100 mt-3" onClick={handleEvaluate} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            평가 중...
          </>
        ) : (
          "선택한 페르소나로 평가하기"
        )}
      </button>

      {errorMessage && <div className="alert alert-danger mt-2">{errorMessage}</div>}

      {loading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">잠시만 기다려주세요. 평가를 진행 중입니다...</p>
        </div>
      )}

      {evaluation && <EvaluationResult evaluation={evaluation} />}

      <button className="btn btn-success w-100 mt-3" onClick={onEvaluate} disabled={loading}>
        {evaluation ? "다음 단계로 이동" : "평가 없이 다음 단계로 이동"}
      </button>
    </div>
  );
}
