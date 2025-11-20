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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await generateText({
        menu,
        context,
        tone,
        channel,
        required_words: requiredWords.split(",").map(w => w.trim()).filter(Boolean),
        banned_words: bannedWords.split(",").map(w => w.trim()).filter(Boolean),
      });
      setResult(data);
    } catch (err) {
      setError("문구 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">일상 스토리 에디터</h1>

      <div className="card p-4 shadow-sm">
        {error && <div className="alert alert-danger">{error}</div>}

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

        <button
          className="btn btn-primary w-100"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "문구 생성 중..." : "문구 생성하기"}
        </button>
      </div>

      {result && (
        <div className="card mt-4 p-4 shadow-sm">
          <h2 className="h5 mb-3">SNS 캡션</h2>
          {result.captions.map((c, i) => (
            <p key={i} className="alert alert-secondary">{c}</p>
          ))}

          <h2 className="h5 mt-3 mb-2">한 줄 광고</h2>
          <p className="fw-bold">{result.one_liner}</p>

          <h2 className="h5 mt-3 mb-2">해시태그</h2>
          <p className="text-primary">{result.hashtags.map(tag => `#${tag}`).join(" ")}</p>
        </div>
      )}
    </div>
  );
}

export default App;
