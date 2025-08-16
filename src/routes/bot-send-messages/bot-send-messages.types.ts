export interface SendMessageRequest {
  userId: string;
  groupId: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  data?: {
    messageId: number;
    sentAt: Date;
  };
  error?: string;
}

export interface SendMessageResult {
  success: boolean;
  data?: {
    messageId: number;
    sentAt: Date;
  };
  error?: string;
}
