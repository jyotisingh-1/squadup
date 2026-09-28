import User from "../models/User.js";
import Game from "../models/Game.js";
function toPublicUser(user) {
  return {
    id: user._id,
    firebaseUid: user.firebaseUid,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    bio: user.bio,
    role: user.role,
    selectedGames: user.selectedGames || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function syncUser(req, res) {
  try {
    const firebaseUid = req.user.uid;
    const email = req.user.email;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        message: "Authenticated token is missing uid or email",
      });
    }

    const existing = await User.findOne({ firebaseUid });

    if (existing) {
      return res.status(200).json(toPublicUser(existing));
    }

    try {
      const created = await User.create({
        firebaseUid,
        email,
        fullName: req.user.name || "",
        username: "",
        bio: "",
        role: "user",
      });

      return res.status(200).json(toPublicUser(created));
    } catch (error) {
      if (error.code === 11000) {
        const duplicate = await User.findOne({ firebaseUid });
        if (duplicate) {
          return res.status(200).json(toPublicUser(duplicate));
        }
      }
      throw error;
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to sync user" });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Sync required.",
      });
    }

    return res.status(200).json(toPublicUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}

export async function updateMe(req, res) {
  try {
    const updates = {};

    if (typeof req.body.fullName === "string") {
      updates.fullName = req.body.fullName.trim();
    }

    if (typeof req.body.username === "string") {
      updates.username = req.body.username.trim();
    }

    if (typeof req.body.bio === "string") {
      updates.bio = req.body.bio.trim();
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found. Sync required.",
      });
    }

    return res.status(200).json(toPublicUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user" });
  }
}
export async function updateSelectedGames(req, res) {
  try {
    const { gameIds } = req.body;

    if (!Array.isArray(gameIds)) {
      return res.status(400).json({
        message: "gameIds must be an array",
      });
    }

    const uniqueGameIds = [...new Set(gameIds)];

    const games = await Game.find({
      _id: { $in: uniqueGameIds },
    }).select("_id");

    if (games.length !== uniqueGameIds.length) {
      return res.status(400).json({
        message: "One or more selected games are invalid",
      });
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: { selectedGames: uniqueGameIds } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found. Sync required.",
      });
    }

    return res.status(200).json({
      message: "Selected games updated successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Failed to update selected games:", error);

    return res.status(500).json({
      message: "Failed to update selected games",
    });
  }
}