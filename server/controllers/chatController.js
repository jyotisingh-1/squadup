import mongoose from "mongoose";
import FriendRequest from "../models/FriendRequest.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const USER_FIELDS = "fullName username email";
const userRoom = (firebaseUid) => `user:${firebaseUid}`;

async function getCurrentUser(firebaseUid) {
  return User.findOne({ firebaseUid });
}

async function getFriend(currentUser, friendId) {
  if (!mongoose.isValidObjectId(friendId)) {
    return { error: { status: 400, message: "A valid friendId is required." } };
  }

  if (currentUser._id.toString() === friendId.toString()) {
    return { error: { status: 400, message: "You cannot start a chat with yourself." } };
  }

  const friend = await User.findById(friendId).select(`${USER_FIELDS} firebaseUid`);
  if (!friend) {
    return { error: { status: 404, message: "User not found." } };
  }

  const friendship = await FriendRequest.exists({
    status: "accepted",
    $or: [
      { requester: currentUser._id, recipient: friend._id },
      { requester: friend._id, recipient: currentUser._id },
    ],
  });

  if (!friendship) {
    return { error: { status: 403, message: "You can only chat with accepted friends." } };
  }

  return { friend };
}

function populatedMessageQuery(query) {
  return query
    .populate("sender", USER_FIELDS)
    .populate("receiver", USER_FIELDS);
}

// GET /api/chat/conversations
export async function getConversations(req, res) {
  try {
    const user = await getCurrentUser(req.user.uid);
    if (!user) return res.status(404).json({ message: "User not found. Sync required." });

    const friendships = await FriendRequest.find({
      status: "accepted",
      $or: [{ requester: user._id }, { recipient: user._id }],
    })
      .populate("requester", USER_FIELDS)
      .populate("recipient", USER_FIELDS);

    const friendsById = new Map();
    for (const friendship of friendships) {
      const other = friendship.requester?._id.toString() === user._id.toString()
        ? friendship.recipient
        : friendship.requester;
      if (other) friendsById.set(other._id.toString(), other);
    }

    const friendIds = [...friendsById.keys()].map((id) => new mongoose.Types.ObjectId(id));
    const activity = friendIds.length
      ? await Message.aggregate([
          {
            $match: {
              $or: [
                { sender: user._id, receiver: { $in: friendIds } },
                { receiver: user._id, sender: { $in: friendIds } },
              ],
            },
          },
          {
            $addFields: {
              friendId: {
                $cond: [{ $eq: ["$sender", user._id] }, "$receiver", "$sender"],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$friendId",
              lastMessage: { $first: "$$ROOT" },
              unreadCount: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ["$receiver", user._id] }, { $eq: ["$read", false] }] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
      : [];

    const activityByFriendId = new Map(activity.map((item) => [item._id.toString(), item]));
    const conversations = [...friendsById.entries()].map(([friendId, friend]) => {
      const recent = activityByFriendId.get(friendId);
      return {
        friend,
        lastMessage: recent?.lastMessage || null,
        unreadCount: recent?.unreadCount || 0,
      };
    });

    conversations.sort((first, second) => {
      const firstDate = first.lastMessage?.createdAt || first.friend.updatedAt || first.friend.createdAt;
      const secondDate = second.lastMessage?.createdAt || second.friend.updatedAt || second.friend.createdAt;
      return new Date(secondDate || 0) - new Date(firstDate || 0);
    });

    return res.status(200).json({ currentUserId: user._id, conversations });
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return res.status(500).json({ message: "Failed to fetch conversations." });
  }
}

// GET /api/chat/:friendId/messages
export async function getConversation(req, res) {
  try {
    const user = await getCurrentUser(req.user.uid);
    if (!user) return res.status(404).json({ message: "User not found. Sync required." });

    const { friend, error } = await getFriend(user, req.params.friendId);
    if (error) return res.status(error.status).json({ message: error.message });

    await Message.updateMany(
      { sender: friend._id, receiver: user._id, read: false },
      { $set: { read: true } }
    );

    const messages = await populatedMessageQuery(
      Message.find({
        $or: [
          { sender: user._id, receiver: friend._id },
          { sender: friend._id, receiver: user._id },
        ],
      }).sort({ createdAt: 1, _id: 1 })
    );

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return res.status(500).json({ message: "Failed to fetch conversation." });
  }
}

// POST /api/chat/:friendId/messages
export async function sendMessage(req, res) {
  try {
    const user = await getCurrentUser(req.user.uid);
    if (!user) return res.status(404).json({ message: "User not found. Sync required." });

    const { friend, error } = await getFriend(user, req.params.friendId);
    if (error) return res.status(error.status).json({ message: error.message });

    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ message: "Message text cannot be empty." });
    if (text.length > 2000) {
      return res.status(400).json({ message: "Messages must be 2000 characters or fewer." });
    }

    const message = await Message.create({
      sender: user._id,
      receiver: friend._id,
      text,
    });
    await message.populate([
      { path: "sender", select: USER_FIELDS },
      { path: "receiver", select: USER_FIELDS },
    ]);

    const io = req.app.get("io");
    io?.to(userRoom(friend.firebaseUid)).emit("message:new", message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Failed to send message:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
}

// PATCH /api/chat/:friendId/read
export async function markConversationRead(req, res) {
  try {
    const user = await getCurrentUser(req.user.uid);
    if (!user) return res.status(404).json({ message: "User not found. Sync required." });

    const { friend, error } = await getFriend(user, req.params.friendId);
    if (error) return res.status(error.status).json({ message: error.message });

    const result = await Message.updateMany(
      { sender: friend._id, receiver: user._id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({ updated: result.modifiedCount });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return res.status(500).json({ message: "Failed to mark messages as read." });
  }
}
