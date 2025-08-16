import { z } from "zod";
import { sendMessageSchema } from "./bot-send-messages.schemas";

// Типи, що генеруються з Zod схем
export type SendMessageRequest = z.infer<typeof sendMessageSchema>;

// Базові інтерфейси
export interface SendMessageData {
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
