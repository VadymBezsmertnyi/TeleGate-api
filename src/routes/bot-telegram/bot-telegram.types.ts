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

export type UserT = z.infer<typeof UserSchema>;
export type ChatT = z.infer<typeof ChatSchema>;
export type ChatMemberT = z.infer<typeof ChatMemberSchema>;
export type MessageT = z.infer<typeof MessageSchema>;
export type MyChatMemberT = z.infer<typeof MyChatMemberSchema>;
export type BotInfoT = z.infer<typeof BotInfoSchema>;
export type TelegramContextT = z.infer<typeof TelegramContextSchema>;
export type UpdateT = z.infer<typeof UpdateSchema>;
export type TelegramBotContextT = z.infer<typeof TelegramBotContextSchema>;
export type ForumTopicCreatedT = z.infer<typeof ForumTopicCreatedSchema>;
export type ForumTopicClosedT = z.infer<typeof ForumTopicClosedSchema>;
export type AcceptedGiftTypesT = z.infer<typeof AcceptedGiftTypesSchema>;

export interface ForumTopicI {
  name: string;
  iconColor: number;
  messageThreadId: number;
  createdBy?: string;
  createdAt: Date;
}

export interface MessageUpdateI {
  update_id: number;
  message: MessageT;
}

export interface MyChatMemberUpdateI {
  update_id: number;
  my_chat_member: MyChatMemberT;
}

export type TelegramUpdateT = MessageUpdateI | MyChatMemberUpdateI;

export interface TelegramBotContextDataI {
  update: TelegramUpdateT;
  telegram: TelegramContextT;
  botInfo: BotInfoT;
  state?: Record<string, any>;
}

export interface GroupMemberI {
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

export interface GroupDataI {
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

export interface MemberDataI {
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
