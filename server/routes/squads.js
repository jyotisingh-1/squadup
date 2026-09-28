import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import {
  getSquads,
  createSquad,
  joinSquad,
  leaveSquad,
  deleteSquad,
} from "../controllers/squadController.js";

const router = express.Router();

// Public: View all squad posts (supports ?gameId=... & ?status=...)
router.get("/", getSquads);

// Protected: Authenticated actions
router.post("/", verifyFirebaseToken, createSquad);
router.post("/:id/join", verifyFirebaseToken, joinSquad);
router.post("/:id/leave", verifyFirebaseToken, leaveSquad);
router.delete("/:id", verifyFirebaseToken, deleteSquad);

export default router;
