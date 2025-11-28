import React, { useState } from "react";

interface PersonaEvaluationFeedback {
  score: number;
  comment: string;
}

interface BreakdownItem {
  score: number;
  reason: string;
}

interface PersonaEvaluationResult {
  personaId: string;
  personaName: string;
  overall_score: number;
  feedback: string;
  captionFeedback: PersonaEvaluationFeedback;
  oneLinerFeedback: PersonaEvaluationFeedback;
  hashtagsFeedback: PersonaEvaluationFeedback;
  breakdown: Record<string, BreakdownItem>;
}

interface PersonaEvaluationResponse {
  results: PersonaEvaluationResult[];
  summary: {
    bestPersonaId: string | null;
    averageScore: number;
    notes: string[];
  };
}

export default function PersonaEvaluationViewer() {
  const [evaluation, setEvaluation] = useState<PersonaEvaluationResponse | null>(null);
  const [error, setError] = useState<string>("");

  const fetchEvaluation = async () => {
    try {
      const response = await fetch("/api/evaluate-personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPersonas: [
            {
              id: "student",
              name: "대학생",
              description: "20대 / 재미·SNS 공유 / 가격 민감, 유행 선호",
              weights: { emotion: 7, offer: 9, cta: 8, local: 4, trend: 9 }
            }
          ],
          caption: "따뜻한 커피 한 잔으로 하루를 시작하세요.",
          one_liner: "오늘 하루, 당신의 마음을 녹여줄 커피.",
          hashtags: ["#전주카페", "#따뜻한커피", "#오늘의휴식"]
        })
      });

      if (!response.ok) throw new Error("API 호출 실패");
      const data: PersonaEvaluationResponse = await response.json();
      setEvaluation(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>📊 페르소나 평가 결과</h2>
      <button className="btn btn-primary mb-3" onClick={fetchEvaluation}>
        평가 요청하기
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      {evaluation && (
        <>
          {evaluation.results.map((res) => (
            <div key={res.personaId} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  {res.personaName} ({res.overall_score}점)
                </h5>
                <p>{res.feedback}</p>

                <ul className="list-group mb-3">
                  <li className="list-group-item">
                    <strong>캡션:</strong> {res.captionFeedback.score}점 - {res.captionFeedback.comment}
                  </li>
                  <li className="list-group-item">
                    <strong>원라이너:</strong> {res.oneLinerFeedback.score}점 - {res.oneLinerFeedback.comment}
                  </li>
                  <li className="list-group-item">
                    <strong>해시태그:</strong> {res.hashtagsFeedback.score}점 - {res.hashtagsFeedback.comment}
                  </li>
                </ul>

                <h6>세부 Breakdown</h6>
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
            <h5>📌 Summary</h5>
            <p>평균 점수: {evaluation.summary.averageScore}</p>
            <p>최적 페르소나: {evaluation.summary.bestPersonaId}</p>
            <ul>
              {evaluation.summary.notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
