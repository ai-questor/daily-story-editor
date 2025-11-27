import { useState } from "react";
import { uploadInstagram } from "../api";

export function useInstagramUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (caption: string, bannerImage: string): Promise<boolean> => {
    setLoading(true);
    setError("");
    try {
      const base64Data = bannerImage.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      const file = new File([blob], "generated-banner.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("file", file);

      await uploadInstagram(formData);
      return true;
    } catch (e) {
      console.error(e);
      setError("Instagram 업로드 중 오류가 발생했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, error };
}
