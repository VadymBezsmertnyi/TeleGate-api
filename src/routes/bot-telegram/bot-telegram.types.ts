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
  ForumTopicClosedSchema,
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
export type ForumTopicClosed = z.infer<typeof ForumTopicClosedSchema>;
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

export interface GroupMember {
  tgUserId: string;
  status:
    | "creator"
    | "administrator"
    | "member"
    | "restricted"
    | "left"
    | "kicked";
  role: "admin" | "moderator" | "member";
  addedBy?: string;
}

export interface GroupData {
  tgChatId: string;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  description?: string;
  photoUrl?: string;
  isForum?: boolean;
  allMembersAreAdministrators?: boolean;
  acceptedGiftTypes?: {
    unlimited_gifts?: boolean;
    limited_gifts?: boolean;
    unique_gifts?: boolean;
    premium_subscription?: boolean;
  };
  botStatus:
    | "creator"
    | "administrator"
    | "member"
    | "restricted"
    | "left"
    | "kicked";
  addedBy?: string;
}

export interface MemberData {
  tgUserId: string;
  isBot: boolean;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  canJoinGroups?: boolean;
  canReadAllGroupMessages?: boolean;
  supportsInlineQueries?: boolean;
  photoUrl?: string;
  userId?: string;
}
