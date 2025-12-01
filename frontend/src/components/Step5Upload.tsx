import type { GenerateResult } from "../types";

type Props = {
  result: GenerateResult | null;
  bannerImage: string | null;
  selectedCaption: string;
  loading: boolean;
  onSubmit: () => void;
};

export default function Step5Upload({
  result, bannerImage, selectedCaption, loading, onSubmit,
}: Props) {
  return (
    <div className="card p-4 shadow-sm mt-3">
      <h2 className="h5 mb-3">Step 5: 인스타그램 업로드</h2>

      {result && (
        <>
          <h3 className="h6">최종 문구</h3>
          <p className="alert alert-secondary">{selectedCaption}</p>
          <p className="fw-bold mt-2">한 줄 광고: {result.one_liner}</p>
          <p className="text-primary">
            {result.hashtags.map(tag => `#${tag}`).join(" ")}
          </p>
        </>
      )}

      {bannerImage && (
        <div className="mt-3">
          <h3 className="h6 mb-2">배너 미리보기</h3>
          <img src={bannerImage} alt="배너 결과" className="img-fluid" />
        </div>
      )}

      <button
        className="btn btn-success w-100 mt-3"
        onClick={onSubmit}
        disabled={loading || !selectedCaption}
      >
        {loading ? "업로드 중..." : "인스타그램 업로드"}
      </button>
    </div>
  );
}
