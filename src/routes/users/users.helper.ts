import UserModel from "./users.model";
import MemberModel from "../members/member.model";
import GroupMemberRelationModel from "../groups/group-member-relation.model";

export const linkUserWithMembersAndGroups = async (
  telegramId: number,
  userId: string
) => {
  try {
    const member = await MemberModel.findOne({
      tgUserId: telegramId.toString(),
    });

    if (member) {
      member.user = userId as any;
      await member.save();

      const groupRelations = await GroupMemberRelationModel.find({
        memberId: member._id,
      }).populate("groupId");

      const groups = groupRelations.map((relation) => relation.groupId);

      await UserModel.findByIdAndUpdate(userId, {
        $addToSet: {
          members: member._id,
          groups: { $each: groups.map((group) => group._id) },
        },
      });

      return {
        member: member._id,
        groups: groups.map((group) => group._id),
        groupRelations: groupRelations.length,
      };
    }

    return null;
  } catch (error) {
    console.error(
      "Помилка при зв'язуванні користувача з членами та групами:",
      error
    );
    return null;
  }
};

export const updateUserMembersAndGroups = async (
  telegramId: number,
  userId: string
) => {
  try {
    const member = await MemberModel.findOne({
      tgUserId: telegramId.toString(),
    });

    if (!member) {
      return null;
    }

    const groupRelations = await GroupMemberRelationModel.find({
      memberId: member._id,
    }).populate("groupId");

    const groups = groupRelations.map((relation) => relation.groupId);

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: {
        members: member._id,
        groups: { $each: groups.map((group) => group._id) },
      },
    });

    return {
      member: member._id,
      groups: groups.map((group) => group._id),
      groupRelations: groupRelations.length,
    };
  } catch (error) {
    console.error("Помилка при оновленні зв'язків користувача:", error);
    return null;
  }
};

export const getUserMembersAndGroups = async (userId: string) => {
  try {
    const user = await UserModel.findById(userId)
      .populate({
        path: "members",
        populate: {
          path: "groups",
          model: "Group",
        },
      })
      .populate("groups")
      .lean();

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        isActive: user.isActive,
        lastActivityAt: user.lastActivityAt,
      },
      members: user.members || [],
      groups: user.groups || [],
    };
  } catch (error) {
    console.error("Помилка при отриманні даних користувача:", error);
    return null;
  }
};
