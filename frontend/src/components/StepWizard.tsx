type Props = {
  step: number;
  total: number;
  progressPercent: number;
  onPrev: () => void;
  onNext: () => void;
  checkpoints: Record<number, boolean>; // 각 단계 완료 여부
};

export default function StepWizard({
  step, total, progressPercent, onPrev, onNext, checkpoints,
}: Props) {
  return (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <strong>Step {step} / {total}</strong>
        </div>
        <div className="small">
          {Array.from({ length: total }).map((_, i) => {
            const idx = i + 1;
            const done = !!checkpoints[idx];
            return (
              <span key={idx} className={`me-2 badge ${done ? "bg-success" : "bg-secondary"}`}>
                {idx}
              </span>
            );
          })}
        </div>
      </div>
      <div className="progress">
        <div className="progress-bar" role="progressbar" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="mt-3 d-flex justify-content-between">
        <button className="btn btn-outline-secondary" onClick={onPrev} disabled={step === 1}>이전</button>
        <button className="btn btn-outline-primary" onClick={onNext} disabled={step === total}>다음</button>
      </div>
    </div>
  );
}
