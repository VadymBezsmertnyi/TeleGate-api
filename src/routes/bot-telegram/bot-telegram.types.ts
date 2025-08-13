import { z } from "zod";
import {
  UserSchema,
  ChatSchema,
  ChatMemberSchema,
  MessageSchema,
  MyChatMemberSchema,
  BotInfoSchema,
  TelegramContextSchema,
  UpdateSchema,
  TelegramBotContextSchema,
  ForumTopicCreatedSchema,
  AcceptedGiftTypesSchema,
} from "./bot-telegram.schemas";

export type User = z.infer<typeof UserSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type ChatMember = z.infer<typeof ChatMemberSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MyChatMember = z.infer<typeof MyChatMemberSchema>;
export type BotInfo = z.infer<typeof BotInfoSchema>;
export type TelegramContext = z.infer<typeof TelegramContextSchema>;
export type Update = z.infer<typeof UpdateSchema>;
export type TelegramBotContext = z.infer<typeof TelegramBotContextSchema>;
export type ForumTopicCreated = z.infer<typeof ForumTopicCreatedSchema>;
export type AcceptedGiftTypes = z.infer<typeof AcceptedGiftTypesSchema>;

export interface ForumTopic {
  name: string;
  iconColor: number;
  messageThreadId: number;
  createdBy?: string;
  createdAt: Date;
}

export interface MessageUpdate {
  update_id: number;
  message: Message;
}

export interface MyChatMemberUpdate {
  update_id: number;
  my_chat_member: MyChatMember;
}

export type TelegramUpdate = MessageUpdate | MyChatMemberUpdate;

export interface TelegramBotContextData {
  update: TelegramUpdate;
  telegram: TelegramContext;
  botInfo: BotInfo;
  state?: Record<string, any>;
}
