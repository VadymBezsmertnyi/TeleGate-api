import { Schema, model } from "mongoose";

const forumTopicSM = new Schema(
  {
    name: { type: String, required: true },
    iconColor: { type: Number, required: true },
    messageThreadId: { type: Number, required: true },
    chat: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
    createdMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    isActive: { type: Boolean, default: true },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ForumTopicModel = model("ForumTopic", forumTopicSM);

export default ForumTopicModel;
