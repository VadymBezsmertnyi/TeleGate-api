import { Router } from "express";
import GroupModel from "./group.model";
import GroupMemberRelationModel from "./group-member-relation.model";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, filter } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (filter === "connected") {
      query.botStatus = { $in: ["creator", "administrator", "member"] };
    } else if (filter === "disconnected") {
      query.botStatus = { $in: ["left", "kicked", "restricted"] };
    }

    const groups = await GroupModel.find(query)
      .populate("addedBy", "firstName lastName username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await GroupModel.countDocuments(query);

    const groupsWithMemberCount = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await GroupMemberRelationModel.countDocuments({
          groupId: group._id,
        });

        return {
          id: group._id,
          tgChatId: group.tgChatId,
          name: group.title,
          type: group.type,
          description: group.description,
          photoUrl: group.photoUrl,
          isForum: group.isForum,
          botStatus: group.botStatus,
          memberCount,
          lastActivity: group.updatedAt,
          addedBy: group.addedBy,
        };
      })
    );

    res.json({
      groups: groupsWithMemberCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await GroupModel.findById(groupId).populate(
      "addedBy",
      "firstName lastName username"
    );
    if (!group) return res.status(404).json({ error: "Group not found" });

    const memberCount = await GroupMemberRelationModel.countDocuments({
      groupId: group._id,
    });
    const groupData = {
      id: group._id,
      tgChatId: group.tgChatId,
      name: group.title,
      type: group.type,
      description: group.description,
      photoUrl: group.photoUrl,
      isForum: group.isForum,
      botStatus: group.botStatus,
      memberCount,
      lastActivity: group.updatedAt,
      addedBy: group.addedBy,
    };

    return res.json(groupData);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch group" });
  }
});

export default router;
