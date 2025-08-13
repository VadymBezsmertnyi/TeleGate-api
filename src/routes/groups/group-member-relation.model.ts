import { Schema, model } from "mongoose";

const groupMemberRelationSM = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "creator",
        "administrator",
        "member",
        "restricted",
        "left",
        "kicked",
      ],
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "moderator", "member"],
    },
    addedBy: { type: Schema.Types.ObjectId, ref: "Member" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

groupMemberRelationSM.index({ groupId: 1, memberId: 1 }, { unique: true });

const GroupMemberRelationModel = model(
  "GroupMemberRelation",
  groupMemberRelationSM
);

export default GroupMemberRelationModel;
