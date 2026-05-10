// Types for the application

export interface User {
  id: number;
  username: string;
  email: string | null;
  is_admin: boolean;
  is_active: boolean;
  must_change_password: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ForbiddenWord {
  id: number;
  word: string;
  category: "profanity" | "hate_speech" | "spam" | "inappropriate";
  severity: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ForbiddenWordCreate {
  word: string;
  category: "profanity" | "hate_speech" | "spam" | "inappropriate";
  severity: number;
}

export interface ForbiddenWordUpdate {
  word?: string;
  category?: "profanity" | "hate_speech" | "spam" | "inappropriate";
  severity?: number;
  is_active?: boolean;
}

export interface DetectionResult {
  word: string;
  original_word: string;
  position_start: number;
  position_end: number;
  severity: number;
  category: string;
  forbidden_word_id: number;
}

export interface ValidationResponse {
  is_clean: boolean;
  original_text: string;
  filtered_text: string;
  violations: DetectionResult[];
  violation_count: number;
}

export interface ChatMessage {
  id: number;
  original_text: string;
  filtered_text: string | null;
  sender_name: string;
  has_violation: boolean;
  violations: DetectionResult[];
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OverviewStats {
  total_messages: number;
  total_violations: number;
  violation_rate: number;
  active_forbidden_words: number;
  messages_today: number;
  violations_today: number;
}

export interface WordFrequency {
  word: string;
  count: number;
  category: string;
  severity: number;
}

export interface TimelineData {
  date: string;
  violations: number;
  messages: number;
}

export interface RecentViolation {
  id: number;
  detected_word: string;
  sender_name: string;
  message_preview: string;
  created_at: string;
}

export interface StatisticsOverview {
  overview: OverviewStats;
  top_words: WordFrequency[];
  timeline: TimelineData[];
  recent_violations: RecentViolation[];
}
