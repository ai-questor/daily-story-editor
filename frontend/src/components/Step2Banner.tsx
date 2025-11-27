import { useState } from "react";
import type { GenerateResult } from "../types";
import { presetBackgrounds } from "../data/presetBackgrounds";

type Props = {
  result: GenerateResult | null;
  productImage: File | null;
  setProductImage: (f: File | null) => void;
  loading: boolean;
  onSubmit: () => void;
  backgroundPrompt: string;
  setBackgroundPrompt: (v: string) => void;
};

export default function Step2Banner({
  result,
  productImage,
  setProductImage,
  loading,
  onSubmit,
  backgroundPrompt,
  setBackgroundPrompt,
}: Props) {
  return (
    <div className="card p-4 shadow-sm mt-3">
      <h2 className="h5 mb-3">Step 2: 배너 이미지 생성</h2>

      {result && (
        <>
          <h3 className="h6">생성된 문구</h3>
          {result.captions.map((c, i) => (
            <p key={i} className="alert alert-secondary">{c}</p>
          ))}
          <p className="fw-bold">{result.one_liner}</p>
          <p className="text-primary">
            {result.hashtags.map(tag => `#${tag}`).join(" ")}
          </p>
        </>
      )}

      {/* 배경 선택 Combobox */}
      <div className="mb-3">
        <label className="form-label">배경 선택</label>
        <select
          className="form-select"
          value={backgroundPrompt}
          onChange={e => setBackgroundPrompt(e.target.value)}
        >
          <option value="">배경을 선택하세요</option>
          {presetBackgrounds.map((bg, i) => (
            <option key={i} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      {/* 직접 입력 Input */}
      <div className="mb-3">
        <label className="form-label">직접 입력 (선택지에 없을 경우)</label>
        <input
          type="text"
          className="form-control"
          placeholder="예: 한옥마을, 전통시장"
          value={backgroundPrompt}
          onChange={e => setBackgroundPrompt(e.target.value)}
        />
      </div>

      {/* 이미지 업로드 */}
      <div className="mb-3">
        <label className="form-label">제품 이미지 업로드</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={e => setProductImage(e.target.files?.[0] ?? null)}
        />
      </div>

      {productImage && (
        <div className="mb-3">
          <img
            src={URL.createObjectURL(productImage)}
            alt="미리보기"
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
