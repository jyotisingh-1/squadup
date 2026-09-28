import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

// Helper to get authenticated User document
async function getAuthUser(firebaseUid) {
  return await User.findOne({ firebaseUid });
}

// POST /api/friends/request - Send a friend request
export async function sendFriendRequest(req, res) {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required." });
    }

    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found. Sync required." });
    }

    // 1. Prevent sending request to self
    if (user._id.toString() === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself." });
    }

    // 2. Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient gamer not found." });
    }

    // 3. Prevent duplicate requests
    const existing = await FriendRequest.findOne({
      $or: [
        { requester: user._id, recipient: recipientId },
        { requester: recipientId, recipient: user._id },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res
          .status(400)
          .json({ message: "You are already friends with this gamer." });
      }

      if (existing.status === "pending") {
        if (existing.requester.toString() === user._id.toString()) {
          return res
            .status(400)
            .json({ message: "Friend request already sent." });
        } else {
          return res.status(400).json({
            message:
              "This gamer has already sent you a request. Check your incoming requests!",
          });
        }
      }

      if (existing.status === "rejected") {
        existing.status = "pending";
        existing.requester = user._id;
        existing.recipient = recipientId;
        await existing.save();

        return res.status(200).json({
          message: "Friend request sent! 🎮",
          request: existing,
        });
      }
    }

    const newRequest = await FriendRequest.create({
      requester: user._id,
      recipient: recipientId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Friend request sent! 🎮",
      request: newRequest,
    });
  } catch (error) {
    console.error("Failed to send friend request:", error);
    return res.status(500).json({ message: "Failed to send friend request." });
  }
}

// GET /api/friends/requests/incoming - Get incoming pending requests
export async function getIncomingRequests(req, res) {
  try {
    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const requests = await FriendRequest.find({
      recipient: user._id,
      status: "pending",
    })
      .populate("requester", "fullName username email bio")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Failed to fetch incoming requests:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch incoming friend requests." });
  }
}

// GET /api/friends/requests/outgoing - Get outgoing pending requests
export async function getOutgoingRequests(req, res) {
  try {
    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const requests = await FriendRequest.find({
      requester: user._id,
      status: "pending",
    })
      .populate("recipient", "fullName username email bio")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Failed to fetch outgoing requests:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch outgoing friend requests." });
  }
}

// PATCH /api/friends/requests/:id/accept - Accept request
export async function acceptFriendRequest(req, res) {
  try {
    const { id } = req.params;

    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const request = await FriendRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    if (request.recipient.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request." });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Request is already ${request.status}.` });
    }

    request.status = "accepted";
    await request.save();

    return res.status(200).json({
      message: "Friend request accepted! 🎉",
      request,
    });
  } catch (error) {
    console.error("Failed to accept friend request:", error);
    return res.status(500).json({ message: "Failed to accept friend request." });
  }
}

// PATCH /api/friends/requests/:id/reject - Reject request
export async function rejectFriendRequest(req, res) {
  try {
    const { id } = req.params;

    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const request = await FriendRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    if (request.recipient.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to reject this request." });
    }

    request.status = "rejected";
    await request.save();

    return res.status(200).json({
      message: "Friend request rejected.",
      request,
    });
  } catch (error) {
    console.error("Failed to reject friend request:", error);
    return res.status(500).json({ message: "Failed to reject friend request." });
  }
}

// DELETE /api/friends/requests/:id/cancel - Cancel outgoing pending request
export async function cancelFriendRequest(req, res) {
  try {
    const { id } = req.params;

    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const request = await FriendRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    if (request.requester.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own sent requests." });
    }

    await request.deleteOne();

    return res.status(200).json({
      message: "Friend request cancelled.",
    });
  } catch (error) {
    console.error("Failed to cancel friend request:", error);
    return res.status(500).json({ message: "Failed to cancel friend request." });
  }
}

// GET /api/friends - Get current user's accepted friends
export async function getFriends(req, res) {
  try {
    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const friendships = await FriendRequest.find({
      status: "accepted",
      $or: [{ requester: user._id }, { recipient: user._id }],
    })
      .populate("requester", "fullName username email bio")
      .populate("recipient", "fullName username email bio")
      .sort({ updatedAt: -1 });

    const friends = friendships.map((f) => {
      const isRequester = f.requester._id.toString() === user._id.toString();
      const friendData = isRequester ? f.recipient : f.requester;
      return {
        friendshipId: f._id,
        friend: friendData,
        since: f.updatedAt,
      };
    });

    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Failed to fetch friends:", error);
    return res.status(500).json({ message: "Failed to fetch friends list." });
  }
}

// DELETE /api/friends/:id - Remove a friend
export async function removeFriend(req, res) {
  try {
    const { id } = req.params;

    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const friendship = await FriendRequest.findById(id);
    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found." });
    }

    const isMember =
      friendship.requester.toString() === user._id.toString() ||
      friendship.recipient.toString() === user._id.toString();

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not part of this friendship." });
    }

    await friendship.deleteOne();

    return res.status(200).json({ message: "Friend removed successfully." });
  } catch (error) {
    console.error("Failed to remove friend:", error);
    return res.status(500).json({ message: "Failed to remove friend." });
  }
}

// GET /api/friends/discover - List other gamers with current relationship state
export async function getDiscoverGamers(req, res) {
  try {
    const user = await getAuthUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 1. Get other users
    const otherUsers = await User.find({ _id: { $ne: user._id } })
      .select("fullName username email bio createdAt")
      .limit(30)
      .sort({ createdAt: -1 });

    // 2. Get all friendships involving current user
    const userRequests = await FriendRequest.find({
      $or: [{ requester: user._id }, { recipient: user._id }],
    });

    // 3. Map status to each gamer
    const gamers = otherUsers.map((gamer) => {
      const match = userRequests.find(
        (r) =>
          r.requester.toString() === gamer._id.toString() ||
          r.recipient.toString() === gamer._id.toString()
      );

      let relationship = "none";
      let requestId = null;

      if (match) {
        requestId = match._id;
        if (match.status === "accepted") {
          relationship = "friends";
        } else if (match.status === "pending") {
          relationship =
            match.requester.toString() === user._id.toString()
              ? "pending_sent"
              : "pending_received";
        }
      }

      return {
        _id: gamer._id,
        fullName: gamer.fullName,
        username: gamer.username,
        email: gamer.email,
        bio: gamer.bio,
        relationship,
        requestId,
      };
    });

    return res.status(200).json({ gamers });
  } catch (error) {
    console.error("Failed to discover gamers:", error);
    return res.status(500).json({ message: "Failed to discover gamers." });
  }
}
