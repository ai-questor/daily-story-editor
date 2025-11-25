type Props = {
  menu: string;
  context: string;
  tone: string;
  channel: string;
  requiredWords: string;
  bannedWords: string;
  setMenu: (v: string) => void;
  setContext: (v: string) => void;
  setTone: (v: string) => void;
  setChannel: (v: string) => void;
  setRequiredWords: (v: string) => void;
  setBannedWords: (v: string) => void;
  loading: boolean;
  onSubmit: () => void;
};

export default function Step1Text(props: Props) {
  const {
    menu, context, tone, channel, requiredWords, bannedWords,
    setMenu, setContext, setTone, setChannel, setRequiredWords, setBannedWords,
    loading, onSubmit,
  } = props;

  return (
    <div className="card p-4 shadow-sm mt-3">
      <h2 className="h5 mb-3">Step 1: 광고 문구 생성</h2>

      <div className="mb-3">
        <label className="form-label">메뉴명</label>
        <input className="form-control" value={menu} onChange={e => setMenu(e.target.value)} placeholder="메뉴명을 입력하세요" />
      </div>

      <div className="mb-3">
        <label className="form-label">상황</label>
        <input className="form-control" value={context} onChange={e => setContext(e.target.value)} placeholder="상황을 입력하세요" />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">톤</label>
          <select className="form-select" value={tone} onChange={e => setTone(e.target.value)}>
            <option>따뜻함</option>
            <option>유머</option>
            <option>프리미엄</option>
            <option>담백</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">채널</label>
          <select className="form-select" value={channel} onChange={e => setChannel(e.target.value)}>
            <option>피드</option>
            <option>스토리</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">필수 단어 (쉼표로 구분)</label>
        <input className="form-control" value={requiredWords} onChange={e => setRequiredWords(e.target.value)} placeholder="예: 전주, 수제" />
      </div>

      <div className="mb-3">
        <label className="form-label">금지 단어 (쉼표로 구분)</label>
        <input className="form-control" value={bannedWords} onChange={e => setBannedWords(e.target.value)} placeholder="예: 최고, 완벽" />
      </div>

      <button className="btn btn-primary w-100" onClick={onSubmit} disabled={loading}>
        {loading ? "생성 중..." : "문구 생성하기"}
      </button>
    </div>
  );
}
