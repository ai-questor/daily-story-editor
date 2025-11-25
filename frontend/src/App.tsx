import { useState } from "react";
import { generateText } from "./api";
import type { GenerateResult } from "./api";

function App() {
  const [menu, setMenu] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("따뜻함");
  const [channel, setChannel] = useState("피드");
  const [requiredWords, setRequiredWords] = useState("");
  const [bannedWords, setBannedWords] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bannerError, setBannerError] = useState("");

  const [productImage, setProductImage] = useState<File | null>(null);

  // 새로 추가: 선택된 캡션 상태
  const [selectedCaption, setSelectedCaption] = useState<string>("");

  const handleGenerateAll = async () => {
    setLoading(true);
    setError("");
    setBannerError("");
    setResult(null);
    setBannerImage(null);

    try {
      const textData = await generateText({
        menu,
        context,
        tone,
        channel,
        required_words: requiredWords.split(",").map(w => w.trim()).filter(Boolean),
        banned_words: bannedWords.split(",").map(w => w.trim()).filter(Boolean),
      });
      setResult(textData);

      if (productImage) {
        const formData = new FormData();
        formData.append("file", productImage);
        formData.append("menu", menu);
        formData.append("context", context);
        formData.append("tone", tone);
        formData.append("channel", channel);
        formData.append("required_words", requiredWords);
        formData.append("banned_words", bannedWords);
        formData.append("text_overlay", `${menu} - 오늘의 추천 메뉴`);

        const res = await fetch("http://localhost:8081/api/generate-banner", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`배너 생성 실패: ${res.status}`);
        }

        const data = await res.json();
        setBannerImage(`data:image/png;base64,${data.image_base64}`);
      }
    } catch (err) {
      console.error(err);
      setError("컨텐츠 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // base64 → Blob 변환 함수
  const base64ToBlob = (base64: string, mimeType = "image/png") => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleInstagramUpload = async () => {
    if (!bannerImage || !result || !selectedCaption) {
      setError("업로드할 배너 이미지와 캡션을 선택해주세요.");
      return;
    }

    try {
      const captionText = `${selectedCaption}\n\n${result.one_liner}\n\n${result.hashtags.map(tag => `#${tag}`).join(" ")}`;

      // bannerImage(base64) → Blob → File 변환
      const base64Data = bannerImage.split(",")[1]; // "data:image/png;base64,..." 제거
      const blob = base64ToBlob(base64Data, "image/png");
      const file = new File([blob], "generated-banner.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("caption", captionText);
      formData.append("file", file);

      const res = await fetch("http://localhost:8081/api/upload-instagram", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Instagram 업로드 실패: ${res.status}`);
      }

      const data = await res.json();
      alert("Instagram 업로드 성공!");
    } catch (err) {
      console.error(err);
      setError("Instagram 업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">일상 스토리 에디터</h1>

      {/* 입력폼 */}
      <div className="card p-4 shadow-sm">
        {error && <div className="alert alert-danger">{error}</div>}
        {bannerError && <div className="alert alert-danger">{bannerError}</div>}

        <div className="mb-3">
          <label className="form-label">메뉴명</label>
          <input
            className="form-control"
            value={menu}
            onChange={e => setMenu(e.target.value)}
            placeholder="메뉴명을 입력하세요"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">상황</label>
          <input
            className="form-control"
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="상황을 입력하세요"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">톤</label>
          <select
            className="form-select"
            value={tone}
            onChange={e => setTone(e.target.value)}
          >
            <option>따뜻함</option>
            <option>유머</option>
            <option>프리미엄</option>
            <option>담백</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">채널</label>
          <select
            className="form-select"
            value={channel}
            onChange={e => setChannel(e.target.value)}
          >
            <option>피드</option>
            <option>스토리</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">필수 단어 (쉼표로 구분)</label>
          <input
            className="form-control"
            value={requiredWords}
            onChange={e => setRequiredWords(e.target.value)}
            placeholder="예: 전주, 수제"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">금지 단어 (쉼표로 구분)</label>
          <input
            className="form-control"
            value={bannedWords}
            onChange={e => setBannedWords(e.target.value)}
            placeholder="예: 최고, 완벽"
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="mb-3">
          <label className="form-label">제품 이미지 업로드</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={e => {
              if (e.target.files?.[0]) {
                setProductImage(e.target.files[0]);
              }
            }}
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
          onClick={handleGenerateAll}
          disabled={loading}
        >
          {loading ? "컨텐츠 생성 중..." : "문구+배너 동시 생성하기"}
        </button>
      </div>

      {/* 결과 카드 */}
      {result && (
        <div className="card mt-4 p-4 shadow-sm">
          <h2 className="h5 mb-3">SNS 캡션</h2>
          {result.captions.map((c, i) => (
            <div key={i} className="form-check mb-2">
              <input
                type="radio"
                className="form-check-input"
                name="captionSelect"
                value={c}
                checked={selectedCaption === c}
                onChange={() => setSelectedCaption(c)}
              />
              <label className="form-check-label">{c}</label>
            </div>
          ))}

          <h2 className="h5 mt-3 mb-2">한 줄 광고</h2>
          <p className="fw-bold">{result.one_liner}</p>

          <h2 className="h5 mt-3 mb-2">해시태그</h2>
          <p className="text-primary">{result.hashtags.map(tag => `#${tag}`).join(" ")}</p>

          {bannerImage && (
            <button
              className="btn btn-success mt-3"
              onClick={handleInstagramUpload}
              disabled={!selectedCaption}
            >
              인스타그램 업로드
            </button>
          )}
        </div>
      )}

      {bannerImage && (
        <div className="card mt-4 p-4 shadow-sm">
          <h2 className="h5 mb-3">광고 배너 이미지</h2>
          <img src={bannerImage} alt="배너 결과" className="img-fluid" />
        </div>
      )}
    </div>
  );
}

export default App;