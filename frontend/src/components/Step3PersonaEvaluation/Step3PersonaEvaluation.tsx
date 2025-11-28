import React, { useState } from "react";
import { DEFAULT_PERSONAS } from "./constants";
import type { Persona, Props, PersonaEvaluationResponse } from "./types";
import PersonaCard from "./PersonaCard";
import PersonaForm from "./PersonaForm";

export default function Step3PersonaEvaluation({ selectedPersonas, setSelectedPersonas, onEvaluate }: Props) {
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

  const togglePersona = (id: string) => {
    if (selectedPersonas.includes(id)) {
      setSelectedPersonas(selectedPersonas.filter(p => p !== id));
    } else {
      setSelectedPersonas([...selectedPersonas, id]);
    }
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

  const handleSaveEdit = (updated: Persona) => {
    setPersonas(personas.map(p => (p.id === updated.id ? updated : p)));
    setEditingId(null);
  };

  const handleEvaluate = async () => {
    if (selectedPersonas.length === 0) {
      setErrorMessage("⚠️ 최소 한 개 이상의 페르소나를 선택해주세요.");
      return;
    }
    setErrorMessage("");

    try {
      const response = await fetch("/api/evaluate-personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPersonas: personas.filter(p => selectedPersonas.includes(p.id)),
          caption: "따뜻한 커피 한 잔으로 하루를 시작하세요.",
          one_liner: "오늘 하루, 당신의 마음을 녹여줄 커피.",
          hashtags: ["#전주카페", "#따뜻한커피", "#오늘의휴식"]
        })
      });

      if (!response.ok) throw new Error("API 호출 실패");
      const data: PersonaEvaluationResponse = await response.json();
      setEvaluation(data);
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  };

  return (
    <div className="card p-4 shadow-sm mt-3">
      <h2 className="h5 mb-3">Step 3: 페르소나 기반 광고문구 평가</h2>

      <div className="row">
        {personas.map(p => (
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
          <PersonaForm newPersona={newPersona} setNewPersona={setNewPersona} onAdd={handleAddPersona} />
        </div>
      </div>

      <button className="btn btn-primary w-100 mt-3" onClick={handleEvaluate}>
        선택한 페르소나로 평가하기
      </button>

      {errorMessage && <div className="alert alert-danger mt-2">{errorMessage}</div>}

      {evaluation && (
        <div className="mt-3">
          <h5>📊 평가 결과</h5>
          {evaluation.results.map((res) => (
            <div key={res.personaId} className="card mb-3">
              <div className="card-body">
                <h6>{res.personaName} ({res.overall_score}점)</h6>
                <p>{res.feedback}</p>
                <ul>
                  <li>캡션: {res.captionFeedback.score}점 - {res.captionFeedback.comment}</li>
                  <li>원라이너: {res.oneLinerFeedback.score}점 - {res.oneLinerFeedback.comment}</li>
                  <li>해시태그: {res.hashtagsFeedback.score}점 - {res.hashtagsFeedback.comment}</li>
                </ul>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>요소</th>
                      <th>점수</th>
                      <th>근거 설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(res.breakdown).map(([factor, item]) => (
                      <tr key={factor}>
                        <td>{factor}</td>
                        <td>{item.score}</td>
                        <td>{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="alert alert-info">
            <h6>📌 Summary</h6>
            <p>평균 점수: {evaluation.summary.averageScore}</p>
            <p>최적 페르소나: {evaluation.summary.bestPersonaId}</p>
            <ul>
              {evaluation.summary.notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button className="btn btn-success w-100 mt-3" onClick={onEvaluate}>
        {evaluation ? "다음 단계로 이동" : "평가 없이 다음 단계로 이동"}
      </button>
    </div>
  );
}
