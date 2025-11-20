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
  const res = await fetch("http://localhost:8000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}
