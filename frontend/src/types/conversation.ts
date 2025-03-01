import { MessageResponse } from './message';

export interface ConversationBase {
  user_id: string;
  title?: string;
}

export interface ConversationCreate extends ConversationBase {
  id?: string;
}

export interface ConversationResponse extends ConversationBase {
  id: string;
}

export interface ConversationWithMessagesResponse extends ConversationResponse {
  messages: MessageResponse[];
}

export interface ConversationUpdate {
  title?: string;
}