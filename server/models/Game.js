import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    genre: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    players: {
      type: String,
      default: "0",
    },

    rating: {
      type: Number,
      default: 4.9,
    },
  },
  { timestamps: true }
);

const Game = mongoose.model("Game", gameSchema);

export default Game;