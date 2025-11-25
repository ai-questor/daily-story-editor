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
