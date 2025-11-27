import { useState } from "react";
import { generateText } from "../api";
import type { GenerateResult } from "../types";

export function useTextGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async (params: {
    menu: string;
    context: string;
    tone: string;
    channel: string;
    requiredWords: string[];
    bannedWords: string[];
  }): Promise<GenerateResult | null> => {
    setLoading(true);
    setError("");
    try {
      const result = await generateText(params);
      return result;
    } catch (e) {
      console.error(e);
      setError("문구 생성 중 오류가 발생했습니다.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}
