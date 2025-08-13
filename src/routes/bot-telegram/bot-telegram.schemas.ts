import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
});

export const AcceptedGiftTypesSchema = z.object({
  unlimited_gifts: z.boolean().optional(),
  limited_gifts: z.boolean().optional(),
  unique_gifts: z.boolean().optional(),
  premium_subscription: z.boolean().optional(),
});

export const ForumTopicCreatedSchema = z.object({
  name: z.string(),
  icon_color: z.number(),
});

export const ChatSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  type: z.enum(["private", "group", "supergroup", "channel"]),
  is_forum: z.boolean().optional(),
  all_members_are_administrators: z.boolean().optional(),
  accepted_gift_types: AcceptedGiftTypesSchema.optional(),
});

export const ChatMemberSchema = z.object({
  user: UserSchema,
  status: z.enum([
    "creator",
    "administrator",
    "member",
    "restricted",
    "left",
    "kicked",
  ]),
});

export const ReplyMessageSchema = z.object({
  message_id: z.number(),
  from: UserSchema.optional(),
  chat: ChatSchema,
  date: z.number(),
  text: z.string().optional(),
  message_thread_id: z.number().optional(),
  forum_topic_created: ForumTopicCreatedSchema.optional(),
  is_topic_message: z.boolean().optional(),
});

export const MessageSchema = z.object({
  message_id: z.number(),
  from: UserSchema.optional(),
  chat: ChatSchema,
  date: z.number(),
  text: z.string().optional(),
  message_thread_id: z.number().optional(),
  forum_topic_created: ForumTopicCreatedSchema.optional(),
  is_topic_message: z.boolean().optional(),
  reply_to_message: ReplyMessageSchema.optional(),
  left_chat_participant: UserSchema.optional(),
  left_chat_member: UserSchema.optional(),
  new_chat_participant: UserSchema.optional(),
  new_chat_member: UserSchema.optional(),
  new_chat_members: z.array(UserSchema).optional(),
});

export const MyChatMemberSchema = z.object({
  chat: ChatSchema,
  from: UserSchema,
  date: z.number(),
  old_chat_member: ChatMemberSchema,
  new_chat_member: ChatMemberSchema,
});

export const BotInfoSchema = z.object({
  id: z.number(),
  is_bot: z.boolean(),
  first_name: z.string(),
  username: z.string(),
  can_join_groups: z.boolean().optional(),
  can_read_all_group_messages: z.boolean().optional(),
  supports_inline_queries: z.boolean().optional(),
  can_connect_to_business: z.boolean().optional(),
  has_main_web_app: z.boolean().optional(),
});

export const TelegramContextSchema = z.object({
  token: z.string(),
  options: z.object({
    apiRoot: z.string(),
    apiMode: z.string(),
    webhookReply: z.boolean(),
    agent: z.any(),
    testEnv: z.boolean(),
  }),
});

export const MessageUpdateSchema = z.object({
  update_id: z.number(),
  message: MessageSchema,
});

export const MyChatMemberUpdateSchema = z.object({
  update_id: z.number(),
  my_chat_member: MyChatMemberSchema,
});

export const UpdateSchema = z.discriminatedUnion("update_id", [
  MessageUpdateSchema,
  MyChatMemberUpdateSchema,
]);

export const TelegramBotContextSchema = z.object({
  update: UpdateSchema,
  telegram: TelegramContextSchema,
  botInfo: BotInfoSchema,
  state: z.record(z.any(), z.any()).optional(),
});
