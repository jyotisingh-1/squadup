import Squad from "../models/Squad.js";
import User from "../models/User.js";
import Game from "../models/Game.js";

// GET /api/squads - List all squad posts (with optional filters)
export async function getSquads(req, res) {
  try {
    const { gameId, status } = req.query;
    const filter = {};

    if (gameId) {
      filter.game = gameId;
    }

    if (status) {
      filter.status = status;
    }

    const squads = await Squad.find(filter)
      .populate("creator", "fullName username email")
      .populate("game", "title genre image players")
      .populate("members", "fullName username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ squads });
  } catch (error) {
    console.error("Failed to fetch squads:", error);
    return res.status(500).json({ message: "Failed to fetch squad posts" });
  }
}

// POST /api/squads - Create a new squad post
export async function createSquad(req, res) {
  try {
    const { gameId, role, description, maxMembers } = req.body;

    if (!gameId) {
      return res.status(400).json({ message: "Game selection is required" });
    }

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Selected game not found" });
    }

    // Find authenticated user
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found. Sync required." });
    }

    const max = Math.min(Math.max(Number(maxMembers) || 4, 2), 10);

    const squad = await Squad.create({
      creator: user._id,
      game: game._id,
      role: role?.trim() || "Any",
      description: description?.trim() || "",
      maxMembers: max,
      members: [user._id],
      status: "open",
    });

    const populated = await Squad.findById(squad._id)
      .populate("creator", "fullName username email")
      .populate("game", "title genre image players")
      .populate("members", "fullName username email");

    return res.status(201).json({
      message: "Squad post created successfully! 🚀",
      squad: populated,
    });
  } catch (error) {
    console.error("Failed to create squad post:", error);
    return res.status(500).json({ message: "Failed to create squad post" });
  }
}

// POST /api/squads/:id/join - Join a squad
export async function joinSquad(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const squad = await Squad.findById(id);
    if (!squad) {
      return res.status(404).json({ message: "Squad post not found." });
    }

    if (squad.status === "closed") {
      return res.status(400).json({ message: "This squad post is closed." });
    }

    const alreadyMember = squad.members.some(
      (m) => m.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "You are already in this squad." });
    }

    if (squad.members.length >= squad.maxMembers) {
      squad.status = "full";
      await squad.save();
      return res.status(400).json({ message: "This squad is already full." });
    }

    squad.members.push(user._id);

    if (squad.members.length >= squad.maxMembers) {
      squad.status = "full";
    }

    await squad.save();

    const populated = await Squad.findById(squad._id)
      .populate("creator", "fullName username email")
      .populate("game", "title genre image players")
      .populate("members", "fullName username email");

    return res.status(200).json({
      message: "You have joined the squad! 🎮",
      squad: populated,
    });
  } catch (error) {
    console.error("Failed to join squad:", error);
    return res.status(500).json({ message: "Failed to join squad" });
  }
}

// POST /api/squads/:id/leave - Leave a squad
export async function leaveSquad(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const squad = await Squad.findById(id);
    if (!squad) {
      return res.status(404).json({ message: "Squad post not found." });
    }

    if (squad.creator.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "Creators cannot leave their own squad. You can delete the post instead.",
      });
    }

    const memberIndex = squad.members.findIndex(
      (m) => m.toString() === user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: "You are not a member of this squad." });
    }

    squad.members.splice(memberIndex, 1);

    if (squad.members.length < squad.maxMembers && squad.status === "full") {
      squad.status = "open";
    }

    await squad.save();

    const populated = await Squad.findById(squad._id)
      .populate("creator", "fullName username email")
      .populate("game", "title genre image players")
      .populate("members", "fullName username email");

    return res.status(200).json({
      message: "Left the squad successfully.",
      squad: populated,
    });
  } catch (error) {
    console.error("Failed to leave squad:", error);
    return res.status(500).json({ message: "Failed to leave squad" });
  }
}

// DELETE /api/squads/:id - Cancel/Delete own squad post
export async function deleteSquad(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const squad = await Squad.findById(id);
    if (!squad) {
      return res.status(404).json({ message: "Squad post not found." });
    }

    if (squad.creator.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this squad post.",
      });
    }

    await squad.deleteOne();

    return res.status(200).json({
      message: "Squad post deleted successfully.",
      squadId: id,
    });
  } catch (error) {
    console.error("Failed to delete squad:", error);
    return res.status(500).json({ message: "Failed to delete squad post" });
  }
}
