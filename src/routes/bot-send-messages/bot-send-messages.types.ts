import { z } from "zod";
import { sendMessageSchema } from "./bot-send-messages.schemas";

// Типи, що генеруються з Zod схем
export type SendMessageRequestT = z.infer<typeof sendMessageSchema>;

// Базові інтерфейси
export interface SendMessageDataI {
  userId: string;
  groupId: string;
  message: string;
}

export interface SendMessageResponseI {
  success: boolean;
  message?: string;
  data?: {
    messageId: number;
    sentAt: Date;
  };
  error?: string;
}

export interface SendMessageResultI {
  success: boolean;
  data?: {
    messageId: number;
    sentAt: Date;
  };
  error?: string;
}
