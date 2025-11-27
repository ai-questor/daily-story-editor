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
  onProceed: () => void;   // Step3Banner로 이동
  goToStep1: () => void;   // Step1로 이동
}

interface FactorResult {
  score: number;
  explanation: string;
}

interface EvaluationResult {
  overall_score: number;
  factors: Record<string, FactorResult>;
  summary: string;
  recommendations: GenerateResult;
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
  goToStep1,
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
      <h2 className="h5 mb-3">Step 2: 다면적 효용성 평가</h2>

      {/* AI가 제안한 문구 후보 */}
      <h3 className="h6">AI 제안 문구 후보</h3>
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

      {/* 내가 직접 수정한 문구 */}
      <h3 className="h6 mt-3">내가 직접 수정한 문구</h3>
      <div className="mb-3">
        <label className="form-label">캡션 (수정 가능)</label>
        <textarea
          className="form-control"
          rows={3}
          value={selectedCaption}
          onChange={(e) => setSelectedCaption(e.target.value)}
          placeholder="선택된 캡션이 여기에 표시됩니다"
        />
      </div>

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

      <div className="mb-3">
        <label className="form-label">해시태그 (쉼표로 구분, 수정 가능)</label>
        <input
          type="text"
          className="form-control"
          value={(hashtags ?? []).join(", ")}
          onChange={(e) =>
            setHashtags(
              e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
            )
          }
          placeholder="예: #전주, #수제"
        />
      </div>

      {/* 버튼은 항상 표시 */}
      <button
        className="btn btn-primary w-100 mb-3"
        onClick={handleEvaluate}
        disabled={!selectedCaption || loading}
      >
        AI 평가 요청하기
      </button>

      {loading && <div className="alert alert-info">AI가 평가 중입니다...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* 평가 결과 */}
      {evaluation && (
        <div className="mt-3">
          <h3 className="h6">AI 다면적 평가 결과</h3>
          <p><strong>종합 점수:</strong> {evaluation.overall_score}/10</p>

          <div className="list-group mb-3">
            {Object.entries(evaluation.factors).map(([factor, res]) => (
              <div key={factor} className="list-group-item">
                <strong>{factor}</strong>: {res.score}/10  
                <br />
                <small>{res.explanation}</small>
              </div>
            ))}
          </div>

          <p><strong>총평:</strong> {evaluation.summary}</p>

          {/* 개선된 추천 문구 표시 */}
          <div className="mt-4">
            <h3 className="h6">AI 추천 개선 문구</h3>
            {evaluation.recommendations && evaluation.recommendations.captions && (
            <div className="mb-3">
                <strong>추천 캡션:</strong>
                <ul>
                {evaluation.recommendations.captions.map((c, i) => (
                    <li key={i}>{c}</li>
                ))}
                </ul>
            </div>
            )}
            <div className="mb-3">
              <strong>추천 한 줄 광고:</strong>
              <p>{evaluation.recommendations.one_liner}</p>
            </div>
            <div className="mb-3">
              <strong>추천 해시태그:</strong>
              <p>{evaluation.recommendations.hashtags.join(", ")}</p>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-secondary flex-fill" onClick={goToStep1}>
              Step1로 돌아가기
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
