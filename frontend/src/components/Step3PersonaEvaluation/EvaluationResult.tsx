import React from "react";
import type { PersonaEvaluationResponse } from "./types";

interface Props {
  evaluation: PersonaEvaluationResponse;
}

export default function EvaluationResult({ evaluation }: Props) {
  return (
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
  );
}
