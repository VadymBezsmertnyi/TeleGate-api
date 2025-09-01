import { Schema, model } from "mongoose";

const acceptedGiftTypesSchema = new Schema(
  {
    unlimited_gifts: { type: Boolean },
    limited_gifts: { type: Boolean },
    unique_gifts: { type: Boolean },
    premium_subscription: { type: Boolean },
  },
  { _id: false }
);

const groupSM = new Schema(
  {
    tgChatId: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ["private", "group", "supergroup", "channel"],
    },
    title: { type: String },
    description: { type: String },
    photoUrl: { type: String },
    isForum: { type: Boolean, default: false },
    allMembersAreAdministrators: { type: Boolean },
    acceptedGiftTypes: acceptedGiftTypesSchema,
    botStatus: {
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
    addedBy: { type: Schema.Types.ObjectId, ref: "Member" },
    users: [{ type: Schema.Types.ObjectId, ref: "users" }],
    members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    forumTopics: [{ type: Schema.Types.ObjectId, ref: "ForumTopic" }],
    groupSubscriptions: [
      { type: Schema.Types.ObjectId, ref: "GroupSubscription" },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const GroupModel = model("Group", groupSM);

export default GroupModel;
