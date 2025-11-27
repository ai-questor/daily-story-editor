import { useState } from "react";
import { generateText, generateBanner, uploadInstagram } from "../api";
import type { GenerateResult } from "../types";
import StepWizard from "../components/StepWizard";
import Step1Text from "../components/Step1Text";
import Step2Banner from "../components/Step2Banner";
import Step3Upload from "../components/Step3Upload";

type BannerForm = {
  product: File | null;
  person: File | null;
  background: File | null;
  prompt: string;
  overlayText: string;
  overlayPosition: string;       // "auto" 포함
  overlayDescription: string;
};

export default function App() {
  const [step, setStep] = useState(1);
  const [menu, setMenu] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("따뜻함");
  const [channel, setChannel] = useState("피드");
  const [requiredWords, setRequiredWords] = useState("");
  const [bannedWords, setBannedWords] = useState("");

  const [result, setResult] = useState<GenerateResult | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<string>("");

  // ✅ 통합 state
  const [bannerForm, setBannerForm] = useState<BannerForm>({
    product: null,
    person: null,
    background: null,
    prompt: "",
    overlayText: "",
    overlayPosition: "auto",
    overlayDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goNext = () => setStep(prev => Math.min(prev + 1, 3));
  const goPrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleGenerateText = async () => {
    setLoading(true);
    setError("");
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
      goNext();
    } catch (e) {
      console.error(e);
      setError("문구 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBanner = async () => {
    if (!bannerForm.product) {
      setError("제품 이미지를 업로드해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file_product", bannerForm.product);
      if (bannerForm.person) formData.append("file_person", bannerForm.person);
      if (bannerForm.background) formData.append("file_background", bannerForm.background);

      // ✅ 이미지 생성에 필요한 값만 전달
      formData.append("background_prompt", bannerForm.prompt);
      formData.append("text_overlay", bannerForm.overlayText);
      formData.append("overlay_position", bannerForm.overlayPosition);
      if (bannerForm.overlayDescription) {
        formData.append("overlay_description", bannerForm.overlayDescription);
      }

      const data = await generateBanner(formData);
      setBannerImage(`data:image/png;base64,${data.image_base64}`);
      goNext();
    } catch (e) {
      console.error(e);
      setError("배너 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const base64ToBlob = (base64: string, mimeType = "image/png") => {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleUploadInstagram = async () => {
    if (!bannerImage || !result || !selectedCaption) {
      setError("배너 이미지와 캡션을 선택해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const captionText =
        `${selectedCaption}\n\n${result.one_liner}\n\n${result.hashtags.map(tag => `#${tag}`).join(" ")}`;

      const base64Data = bannerImage.split(",")[1];
      const blob = base64ToBlob(base64Data, "image/png");
      const file = new File([blob], "generated-banner.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("caption", captionText);
      formData.append("file", file);

      await uploadInstagram(formData);
      alert("Instagram 업로드 성공!");
    } catch (e) {
      console.error(e);
      setError("Instagram 업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / 3) * 100;

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">일상 스토리 에디터</h1>

      <StepWizard
        step={step}
        total={3}
        progressPercent={progressPercent}
        onPrev={goPrev}
        onNext={goNext}
        checkpoints={{
          1: !!result,
          2: !!bannerImage,
          3: false,
        }}
      />

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {step === 1 && (
        <Step1Text
          menu={menu}
          context={context}
          tone={tone}
          channel={channel}
          requiredWords={requiredWords}
          bannedWords={bannedWords}
          setMenu={setMenu}
          setContext={setContext}
          setTone={setTone}
          setChannel={setChannel}
          setRequiredWords={setRequiredWords}
          setBannedWords={setBannedWords}
          loading={loading}
          onSubmit={handleGenerateText}
        />
      )}

      {step === 2 && (
        <Step2Banner
          result={result}
          form={bannerForm}
          setForm={setBannerForm}
          loading={loading}
          onSubmit={handleGenerateBanner}
        />
      )}

      {step === 3 && (
        <Step3Upload
          result={result}
          bannerImage={bannerImage}
          selectedCaption={selectedCaption}
          setSelectedCaption={setSelectedCaption}
          loading={loading}
          onSubmit={handleUploadInstagram}
        />
      )}
    </div>
  );
}
