export interface Session {
  id: string;
  course_id: string;
  session_number: number;
  name: string;
  source_pdf_path: string | null;
  created_at: string;
}

export interface RegistryNode {
  id: string;
  session_id: string;
  section_id: string;
  parent_id: string | null;
  level: number;
  order_index: number;
  title_fa: string;
  title_en: string | null;
}

export interface ContentBlock {
  id: string;
  session_id: string;
  section_id: string;
  stage: number;
  content_ref: string;
  block_type: string;
  text: string;
  question?: string;
  answer?: string;
  order_index: number;
}

export interface AssessmentItem {
  id: string;
  session_id: string;
  section_id: string;
  item_type: string;
  question: string;
  answer: string;
  order_index: number;
}

export interface McqItem {
  id: string;
  session_id: string;
  section_id: string;
  difficulty: string;
  stem: string;
  options: Record<string, string>;
  correct_option: string;
  rationale: string;
  order_index: number;
}