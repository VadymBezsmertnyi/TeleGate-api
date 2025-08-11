import { Schema, model } from "mongoose";

const messageSM = new Schema(
  {
    tgMessageId: { type: String, required: true },
    from: { type: Schema.Types.ObjectId, ref: "Member" },
    chat: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    date: { type: Number, required: true },
    text: { type: String },
    leftChatMember: { type: Schema.Types.ObjectId, ref: "Member" },
    newChatMember: { type: Schema.Types.ObjectId, ref: "Member" },
    newChatMembers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    kind: {
      type: String,
      required: true,
      enum: ["message", "my_chat_member"],
    },
    myChatMemberOld: {
      user: { type: Schema.Types.ObjectId, ref: "Member" },
      status: {
        type: String,
        enum: [
          "creator",
          "administrator",
          "member",
          "restricted",
          "left",
          "kicked",
        ],
      },
    },
    myChatMemberNew: {
      user: { type: Schema.Types.ObjectId, ref: "Member" },
      status: {
        type: String,
        enum: [
          "creator",
          "administrator",
          "member",
          "restricted",
          "left",
          "kicked",
        ],
      },
    },
    members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

messageSM.index({ tgMessageId: 1, chat: 1 }, { unique: true });
messageSM.index({ chat: 1, date: -1 });

const MessageModel = model("Message", messageSM);

export default MessageModel;
