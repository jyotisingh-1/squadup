import mongoose from "mongoose";

const squadSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: "Any",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxLength: 300,
    },
    maxMembers: {
      type: Number,
      default: 4,
      min: 2,
      max: 10,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["open", "full", "closed"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

const Squad = mongoose.model("Squad", squadSchema);

export default Squad;
