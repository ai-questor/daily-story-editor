// api.tsx

export interface GeneratePayload {
  menu: string;
  context: string;
  tone: string;
  channel: string;
  required_words?: string[];
  banned_words?: string[];
}

export interface GenerateResult {
  captions: string[];
  one_liner: string;
  hashtags: string[];
}

// 텍스트 생성 API
export async function generateText(payload: GeneratePayload): Promise<GenerateResult> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  return {
    captions: data.captions ?? [],
    one_liner: data.one_liner ?? "",
    hashtags: data.hashtags ?? [],
  };
}

// 배너 이미지 생성 API
export async function generateBanner(formData: FormData): Promise<{ image_base64: string }> {
  const res = await fetch("/api/generate-banner", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`배너 생성 실패: ${res.status}`);
  }

  return res.json();
}

// 인스타그램 업로드 API
export async function uploadInstagram(formData: FormData): Promise<any> {
  const res = await fetch("/api/upload-instagram", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Instagram 업로드 실패: ${res.status}`);
  }

  return res.json();
}
