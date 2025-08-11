import { z } from "zod";
import {
  UserSchema,
  ChatSchema,
  ChatMemberSchema,
  MessageSchema,
  ReplyMessageSchema,
  MyChatMemberSchema,
  BotInfoSchema,
  TelegramContextSchema,
  MessageUpdateSchema,
  MyChatMemberUpdateSchema,
  UpdateSchema,
  TelegramBotContextSchema,
} from "./bot-telegram.schemas";

export type User = z.infer<typeof UserSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type ChatMember = z.infer<typeof ChatMemberSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ReplyMessage = z.infer<typeof ReplyMessageSchema>;
export type MyChatMember = z.infer<typeof MyChatMemberSchema>;

export type BotInfo = z.infer<typeof BotInfoSchema>;
export type TelegramContext = z.infer<typeof TelegramContextSchema>;

export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;
export type MyChatMemberUpdate = z.infer<typeof MyChatMemberUpdateSchema>;
export type Update = z.infer<typeof UpdateSchema>;

export type TelegramBotContext = z.infer<typeof TelegramBotContextSchema>;

export interface BotAddedMessage extends Message {
  new_chat_participant: User;
  new_chat_member: User;
  new_chat_members: User[];
}

export interface BotRemovedMessage extends Message {
  left_chat_participant: User;
  left_chat_member: User;
}

export interface ReplyToBotMessage extends Message {
  reply_to_message: ReplyMessage & {
    from: User & { is_bot: true };
  };
}

export interface TextMessage extends Message {
  text: string;
}

export type ChatMemberStatus =
  | "creator"
  | "administrator"
  | "member"
  | "restricted"
  | "left"
  | "kicked";
export type ChatType = "private" | "group" | "supergroup" | "channel";

export interface BotStatusChange {
  oldStatus: ChatMemberStatus;
  newStatus: ChatMemberStatus;
  isBotAdded: boolean;
  isBotRemoved: boolean;
}

export type UpdateType = "message" | "my_chat_member";

export interface UpdateInfo {
  type: UpdateType;
  updateId: number;
  timestamp: number;
  chatId: number;
  chatType: ChatType;
  userId?: number;
  isBot: boolean;
}

export const isBotAddedMessage = (
  message: Message
): message is BotAddedMessage => {
  return !!(
    message.new_chat_participant ||
    message.new_chat_member ||
    message.new_chat_members
  );
};

export const isBotRemovedMessage = (
  message: Message
): message is BotRemovedMessage => {
  return !!(message.left_chat_participant || message.left_chat_member);
};

export const isReplyToBotMessage = (
  message: Message
): message is ReplyToBotMessage => {
  return !!message.reply_to_message?.from?.is_bot;
};

export const isTextMessage = (message: Message): message is TextMessage => {
  return typeof message.text === "string";
};

export const isBotStatusChange = (myChatMember: MyChatMember): boolean => {
  return (
    myChatMember.old_chat_member.user.is_bot &&
    myChatMember.new_chat_member.user.is_bot
  );
};

export const getUpdateInfo = (update: Update): UpdateInfo => {
  if ("message" in update) {
    return {
      type: "message",
      updateId: update.update_id,
      timestamp: update.message.date,
      chatId: update.message.chat.id,
      chatType: update.message.chat.type,
      userId: update.message.from?.id,
      isBot: update.message.from?.is_bot || false,
    };
  } else if ("my_chat_member" in update) {
    return {
      type: "my_chat_member",
      updateId: update.update_id,
      timestamp: update.my_chat_member.date,
      chatId: update.my_chat_member.chat.id,
      chatType: update.my_chat_member.chat.type,
      userId: update.my_chat_member.from.id,
      isBot: update.my_chat_member.from.is_bot,
    };
  }

  throw new Error("Unknown update type");
};

export const getBotStatusChange = (
  myChatMember: MyChatMember
): BotStatusChange => {
  const oldStatus = myChatMember.old_chat_member.status;
  const newStatus = myChatMember.new_chat_member.status;

  return {
    oldStatus,
    newStatus,
    isBotAdded: oldStatus === "left" && newStatus === "member",
    isBotRemoved: oldStatus === "member" && newStatus === "left",
  };
};
