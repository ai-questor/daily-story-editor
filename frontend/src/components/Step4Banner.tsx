import type { GenerateResult } from "../types";
import { presetBackgrounds } from "../data/presetBackgrounds";

type BannerForm = {
  product: File | null;
  person: File | null;
  background: File | null;
  prompt: string;
  overlayText: string;
  overlayPosition: string;
  overlayDescription: string;
};

type Props = {
  result: GenerateResult | null;
  form: BannerForm;
  setForm: (f: BannerForm) => void;
  loading: boolean;
  onSubmit: () => void;
};

export default function Step4Banner({ result, form, setForm, loading, onSubmit }: Props) {
  return (
    <div className="card p-4 shadow-sm mt-3">
      <h2 className="h5 mb-3">Step 4: 배너 이미지 생성</h2>

      {/* 배경 프롬프트 선택 */}
      <div className="mb-3">
        <label className="form-label">배경 선택 (콤보박스)</label>
        <select
          className="form-select"
          value={form.prompt}
          onChange={e => setForm({ ...form, prompt: e.target.value })}
        >
          <option value="">배경을 선택하세요</option>
          {presetBackgrounds.map((bg, i) => (
            <option key={i} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      {/* 직접 입력 */}
      <div className="mb-3">
        <label className="form-label">직접 입력 (선택지에 없을 경우)</label>
        <input
          type="text"
          className="form-control"
          placeholder="예: 한옥마을, 전통시장, 웃는 손님과 함께..."
          value={form.prompt}
          onChange={e => setForm({ ...form, prompt: e.target.value })}
        />
      </div>

      {/* 오버레이 텍스트 */}
      <div className="mb-3">
        <label className="form-label">배너에 들어갈 문구</label>
        <input
          type="text"
          className="form-control"
          placeholder="예: 크리스마스 특별 할인 이벤트 🎄"
          value={form.overlayText}
          onChange={e => setForm({ ...form, overlayText: e.target.value })}
        />
      </div>

      {/* 오버레이 위치 */}
      <div className="mb-3">
        <label className="form-label">오버레이 위치</label>
        <select
          className="form-select"
          value={form.overlayPosition}
          onChange={e => setForm({ ...form, overlayPosition: e.target.value })}
        >
          <option value="auto">자동 배치 (알아서 해당)</option>
          <option value="top-left">상단 왼쪽</option>
          <option value="top-center">상단 중앙</option>
          <option value="top-right">상단 오른쪽</option>
          <option value="middle-left">가운데 왼쪽</option>
          <option value="middle-center">가운데 중앙</option>
          <option value="middle-right">가운데 오른쪽</option>
          <option value="bottom-left">하단 왼쪽</option>
          <option value="bottom-center">하단 중앙</option>
          <option value="bottom-right">하단 오른쪽</option>
        </select>
      </div>

      {/* 오버레이 설명 */}
      <div className="mb-3">
        <label className="form-label">오버레이 텍스트 설명 (선택)</label>
        <textarea
          className="form-control"
          placeholder="예: 굵은 글씨, 빨간색, 제품 위에 배치"
          value={form.overlayDescription}
          onChange={e => setForm({ ...form, overlayDescription: e.target.value })}
        />
      </div>

      {/* 제품 이미지 (필수) */}
      <div className="mb-3">
        <label className="form-label">제품 이미지 업로드 (필수)</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={e => setForm({ ...form, product: e.target.files?.[0] ?? null })}
        />
      </div>
      {form.product && (
        <div className="mb-3">
          <img
            src={URL.createObjectURL(form.product)}
            alt="제품 미리보기"
            className="img-thumbnail"
            style={{ maxWidth: "200px" }}
          />
        </div>
      )}

      {/* 사람 이미지 (옵션) */}
      <div className="mb-3">
        <label className="form-label">사람 이미지 업로드 (옵션)</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={e => setForm({ ...form, person: e.target.files?.[0] ?? null })}
        />
      </div>
      {form.person && (
        <div className="mb-3">
          <img
            src={URL.createObjectURL(form.person)}
            alt="사람 미리보기"
            className="img-thumbnail"
            style={{ maxWidth: "200px" }}
          />
        </div>
      )}

      {/* 배경 이미지 (옵션) */}
      <div className="mb-3">
        <label className="form-label">배경 이미지 업로드 (옵션)</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={e => setForm({ ...form, background: e.target.files?.[0] ?? null })}
        />
      </div>
      {form.background && (
        <div className="mb-3">
          <img
            src={URL.createObjectURL(form.background)}
            alt="배경 미리보기"
            className="img-thumbnail"
            style={{ maxWidth: "200px" }}
          />
        </div>
      )}

      <button
        className="btn btn-primary w-100"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? "배너 생성 중..." : "배너 생성하기"}
      </button>
    </div>
  );
}

