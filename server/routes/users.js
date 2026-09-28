import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import {
  syncUser,
  getMe,
  updateMe,
  updateSelectedGames,
} from "../controllers/userController.js";
const router = Router();

router.use(verifyFirebaseToken);

router.post("/sync", syncUser);
router.get("/me", getMe);
router.patch("/me", updateMe);
router.patch("/me/games", updateSelectedGames);
export default router;
