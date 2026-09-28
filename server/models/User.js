import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    selectedGames: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
  },
],
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
