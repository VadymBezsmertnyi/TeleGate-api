import UserModel from "./users.model";
import MemberModel from "../members/members.model";

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
      const groups = member.groups || [];
      await UserModel.findByIdAndUpdate(userId, {
        $addToSet: {
          members: member._id,
          groups: { $each: groups },
        },
      });

      return {
        member: member._id,
        groups: groups,
        groupRelations: groups.length,
      };
    }

    return null;
  } catch (error) {
    console.warn(
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
    if (!member) return null;

    const groups = member.groups || [];
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: {
        members: member._id,
        groups: { $each: groups },
      },
    });

    return {
      member: member._id,
      groups: groups,
      groupRelations: groups.length,
    };
  } catch (error) {
    console.warn("Помилка при оновленні зв'язків користувача:", error);
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
    console.warn("Помилка при отриманні даних користувача:", error);
    return null;
  }
};
