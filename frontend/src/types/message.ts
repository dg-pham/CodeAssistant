export interface MessageBase {
  role: 'user' | 'assistant';
  content: string;
  conversation_id: string;
}

export interface MessageCreate extends MessageBase {}

export interface MessageResponse extends MessageBase {
  id: string;
  timestamp: string;
}