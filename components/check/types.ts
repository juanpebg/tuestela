export type SourceRef = {
  id: string;
  label: string;
};

export type GuidedBreach = {
  title: string;
  domain: string;
  date: string;
  leaked: string[];
  note: string | null;
  sources?: SourceRef[];
  happened?: string;
  means?: string;
  todo?: string;
  group?: "primero" | "tambien";
};

export type PlanStep = {
  title: string;
  text: string;
};

export type GuidedView = {
  found: boolean;
  summary: string;
  detail: string;
  footnote: string | null;
  speech?: string;
  plan?: PlanStep[];
  breaches: GuidedBreach[];
  advice: { label: string; explanation: string; recommendation: string }[];
};

export type ChatMessage = {
  id: string;
  role: "estela" | "user";
  at: string;
  text?: string;
  card?: GuidedBreach;
  privacy?: boolean;
};
