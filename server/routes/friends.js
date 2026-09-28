import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriends,
  removeFriend,
  getDiscoverGamers,
} from "../controllers/friendController.js";

const router = express.Router();

// All friends endpoints are protected
router.use(verifyFirebaseToken);

// Requests
router.post("/request", sendFriendRequest);
router.get("/requests/incoming", getIncomingRequests);
router.get("/requests/outgoing", getOutgoingRequests);
router.patch("/requests/:id/accept", acceptFriendRequest);
router.patch("/requests/:id/reject", rejectFriendRequest);
router.delete("/requests/:id/cancel", cancelFriendRequest);

// Friends list & removal
router.get("/", getFriends);
router.delete("/:id", removeFriend);

// Discover other gamers
router.get("/discover", getDiscoverGamers);

export default router;
