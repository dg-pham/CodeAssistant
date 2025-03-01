export interface FeedbackBase {
  message_id: string;
  rating: number; // 1-5
  comment?: string;
}

export interface FeedbackCreate extends FeedbackBase {}

export interface FeedbackResponse extends FeedbackBase {
  id: string;
  created_at: string;
}