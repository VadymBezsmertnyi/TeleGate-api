import { Schema, model } from "mongoose";

const groupSM = new Schema(
  {
    tgChatId: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ["private", "group", "supergroup", "channel"],
    },
    title: { type: String },
    allMembersAreAdministrators: { type: Boolean },
    acceptedGiftTypes: {
      unlimited_gifts: { type: Boolean },
      limited_gifts: { type: Boolean },
      unique_gifts: { type: Boolean },
      premium_subscription: { type: Boolean },
    },
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

groupSM.index({ tgChatId: 1 }, { unique: true });

const GroupModel = model("Group", groupSM);

export default GroupModel;
