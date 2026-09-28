import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Canonicalized user pair used to prevent reverse-direction duplicates.
    pairKey: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to quickly query pairwise friendships
friendRequestSchema.index({ requester: 1, recipient: 1 });
friendRequestSchema.index({ pairKey: 1 }, { unique: true, sparse: true });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
