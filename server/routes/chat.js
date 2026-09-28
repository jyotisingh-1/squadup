import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import {
  getConversation,
  getConversations,
  markConversationRead,
  sendMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(verifyFirebaseToken);

router.get("/conversations", getConversations);
router.get("/:friendId/messages", getConversation);
router.post("/:friendId/messages", sendMessage);
router.patch("/:friendId/read", markConversationRead);

export default router;
