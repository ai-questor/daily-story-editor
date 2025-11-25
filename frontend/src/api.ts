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

export async function generateText(payload: GeneratePayload): Promise<GenerateResult> {
  const res = await fetch("http://localhost:8081/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();

  return {
    captions: data.captions ?? [],
    one_liner: data.one_liner ?? "",
    hashtags: data.hashtags ?? []
  };
}
