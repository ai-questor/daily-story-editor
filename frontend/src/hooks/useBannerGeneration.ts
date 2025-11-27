import { useState } from "react";
import { generateBanner } from "../api";

export function useBannerGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async (formData: FormData): Promise<string | null> => {
    setLoading(true);
    setError("");
    try {
      const data = await generateBanner(formData);
      return `data:image/png;base64,${data.image_base64}`;
    } catch (e) {
      console.error(e);
      setError("배너 생성 중 오류가 발생했습니다.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}
