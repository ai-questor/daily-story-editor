import React, { useState } from "react";
import axios from "axios";
import type { GenerateResult } from "../types";

interface Props {
  result: GenerateResult | null;
  selectedCaption: string;
  setSelectedCaption: (v: string) => void;
  oneLiner: string;
  setOneLiner: (v: string) => void;
  hashtags: string[];
  setHashtags: (v: string[]) => void;
  onProceed: () => void;
  onEdit: () => void;
}

interface EvaluationResult {
  score: number;
  explanation: string;
  suggestions: string[];
}

export default function Step2Evaluation({
  result,
  selectedCaption,
  setSelectedCaption,
  oneLiner,
  setOneLiner,
  hashtags,
  setHashtags,
  onProceed,
  onEdit,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!selectedCaption || !result) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<EvaluationResult>("/api/evaluate-content", {
        caption: selectedCaption,
        one_liner: oneLiner,
        hashtags,
      });
      setEvaluation(response.data);
    } catch (err: any) {
      setError("AI 평가 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!result) return <p>문구가 아직 생성되지 않았습니다.</p>;

  return (
    <div className="card p-4 shadow-sm mt-3">
      <h2 className="h5 mb-3">Step 2: 효용성 평가</h2>

      {/* 캡션 선택 */}
      <h3 className="h6">캡션 선택</h3>
      {result.captions.map((c, i) => (
        <div key={i} className="form-check mb-2">
          <input
            type="radio"
            className="form-check-input"
            name="captionSelectStep2"
            value={c}
            checked={selectedCaption === c}
            onChange={(e) => setSelectedCaption(e.target.value)}
          />
          <label className="form-check-label">{c}</label>
        </div>
      ))}

      {/* 선택된 캡션 수정 가능 (textarea) */}
      <div className="mb-3 mt-2">
        <label className="form-label">선택된 캡션 (수정 가능)</label>
        <textarea
          className="form-control"
          rows={3}
          value={selectedCaption}
          onChange={(e) => setSelectedCaption(e.target.value)}
          placeholder="선택된 캡션이 여기에 표시됩니다"
        />
      </div>

      {/* one_liner 수정 가능 */}
      <div className="mb-3">
        <label className="form-label">한 줄 광고 (수정 가능)</label>
        <input
          type="text"
          className="form-control"
          value={oneLiner}
          onChange={(e) => setOneLiner(e.target.value)}
          placeholder="한 줄 광고 문구를 입력하세요"
        />
      </div>

      {/* hashtags 수정 가능 */}
      <div className="mb-3">
        <label className="form-label">해시태그 (쉼표로 구분, 수정 가능)</label>
        <input
          type="text"
          className="form-control"
          value={hashtags.join(", ")}
          onChange={(e) => setHashtags(e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))}
          placeholder="예: #전주, #수제"
        />
      </div>

      {!evaluation && !loading && (
        <button
          className="btn btn-primary w-100 mb-3"
          onClick={handleEvaluate}
          disabled={!selectedCaption}
        >
          AI 평가 요청하기
        </button>
      )}
      {loading && <div className="alert alert-info">AI가 평가 중입니다...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {evaluation && (
        <div className="mt-3">
          <h3 className="h6">AI 평가 결과</h3>
          <p><strong>점수:</strong> {evaluation.score}/10</p>
          <p><strong>설명:</strong> {evaluation.explanation}</p>
          <ul className="list-group mb-3">
            {evaluation.suggestions.map((s, idx) => (
              <li key={idx} className="list-group-item">{s}</li>
            ))}
          </ul>

          <div className="d-flex gap-2">
            <button className="btn btn-secondary flex-fill" onClick={onEdit}>
              문구 수정하기
            </button>
            <button className="btn btn-success flex-fill" onClick={onProceed}>
              이미지 생성 진행하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
