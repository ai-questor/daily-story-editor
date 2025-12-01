import { useState } from "react";
import type { GenerateResult } from "../types";
import StepWizard from "../components/StepWizard";
import Step1Text from "../components/Step1Text";
import Step2Evaluation from "../components/Step2Evaluation";
import Step3PersonaEvaluation from "../components/Step3PersonaEvaluation";
import Step4Banner from "../components/Step4Banner";
import Step5Upload from "../components/Step5Upload";
import { useTextGeneration } from "../hooks/useTextGeneration";
import { useBannerGeneration } from "../hooks/useBannerGeneration";
import { useInstagramUpload } from "../hooks/useInstagramUpload";

type BannerForm = {
  product: File | null;
  person: File | null;
  background: File | null;
  prompt: string;
  overlayText: string;
  overlayPosition: string;
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
  const [evaluationDone, setEvaluationDone] = useState<boolean>(false);

  const [selectedCaption, setSelectedCaption] = useState<string>("");
  const [oneLiner, setOneLiner] = useState<string>("");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const [bannerForm, setBannerForm] = useState<BannerForm>({
    product: null,
    person: null,
    background: null,
    prompt: "",
    overlayText: "",
    overlayPosition: "auto",
    overlayDescription: "",
  });

  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);

  const { generate: generateText, loading: textLoading, error: textError } = useTextGeneration();
  const { generate: generateBanner, loading: bannerLoading, error: bannerError } = useBannerGeneration();
  const { upload: uploadInstagram, loading: uploadLoading, error: uploadError } = useInstagramUpload();

  const goNext = () => setStep(prev => Math.min(prev + 1, 5));
  const goPrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleGenerateText = async () => {
    const data = await generateText({
      menu,
      context,
      tone,
      channel,
      requiredWords: requiredWords.split(",").map(w => w.trim()).filter(Boolean),
      bannedWords: bannedWords.split(",").map(w => w.trim()).filter(Boolean),
    });
    if (data) {
      setResult(data);
      if (data.captions.length > 0) setSelectedCaption(data.captions[0].trim());
      setOneLiner(data.one_liner);
      setHashtags(data.hashtags ?? []);
      setStep(2);
    }
  };

  const handleGenerateBanner = async () => {
    if (!bannerForm.product) return;
    const formData = new FormData();
    formData.append("file_product", bannerForm.product);
    if (bannerForm.person) formData.append("file_person", bannerForm.person);
    if (bannerForm.background) formData.append("file_background", bannerForm.background);
    formData.append("background_prompt", bannerForm.prompt);
    formData.append("text_overlay", bannerForm.overlayText);
    formData.append("overlay_position", bannerForm.overlayPosition);
    if (bannerForm.overlayDescription) {
      formData.append("overlay_description", bannerForm.overlayDescription);
    }
    const image = await generateBanner(formData);
    if (image) {
      setBannerImage(image);
      setStep(5);
    }
  };

  const handleUploadInstagram = async () => {
    if (!bannerImage || !result || !selectedCaption) return;
    const captionText =
      `${selectedCaption}\n\n${oneLiner}\n\n${hashtags.map(tag => `#${tag}`).join(" ")}`;
    const success = await uploadInstagram(captionText, bannerImage);
    if (success) alert("Instagram 업로드 성공!");
  };

  const totalSteps = 5;
  const progressPercent = (step / totalSteps) * 100;
  const error = textError || bannerError || uploadError;

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">일상 스토리 에디터</h1>

      <StepWizard
        step={step}
        total={totalSteps}
        progressPercent={progressPercent}
        onPrev={goPrev}
        onNext={goNext}
        checkpoints={{
          1: !!result,
          2: evaluationDone,
          3: selectedPersonas.length > 0,
          4: !!bannerImage,
          5: false,
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
          loading={textLoading}
          onSubmit={handleGenerateText}
        />
      )}

      {step === 2 && (
        <Step2Evaluation
          result={result}
          selectedCaption={selectedCaption}
          setSelectedCaption={setSelectedCaption}
          oneLiner={oneLiner}
          setOneLiner={setOneLiner}
          hashtags={hashtags}
          setHashtags={setHashtags}
          onProceed={() => {
            setEvaluationDone(true);
            setStep(3);
          }}
          goToStep1={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3PersonaEvaluation
          selectedPersonas={selectedPersonas}
          setSelectedPersonas={setSelectedPersonas}
          caption={selectedCaption}
          oneLiner={oneLiner}
          hashtags={hashtags}
          onEvaluate={() => {
            setEvaluationDone(true);
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <Step4Banner
          result={result}
          form={bannerForm}
          setForm={setBannerForm}
          loading={bannerLoading}
          onSubmit={handleGenerateBanner}
        />
      )}

      {step === 5 && (
        <Step5Upload
          result={result}
          bannerImage={bannerImage}
          selectedCaption={selectedCaption}
          loading={uploadLoading}
          onSubmit={handleUploadInstagram}
        />
      )}
    </div>
  );
}
