import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Game from "./models/Game.js";

const games = [
  {
    title: "BGMI",
    genre: "Battle Royale",
    image: "/images/bgmi.jpg",
    players: "100M+",
    rating: 4.9,
  },
  {
    title: "Call of Duty Mobile",
    genre: "FPS",
    image: "/images/codm.jpg",
    players: "50M+",
    rating: 4.8,
  },
  {
    title: "Free Fire MAX",
    genre: "Battle Royale",
    image: "/images/ffmax.jpg",
    players: "100M+",
    rating: 4.8,
  },
  {
    title: "Valorant",
    genre: "FPS",
    image: "/images/valorant.png",
    players: "20M+",
    rating: 4.9,
  },
  {
    title: "Counter-Strike 2",
    genre: "FPS",
    image: "/images/cs2.png",
    players: "1M+",
    rating: 4.9,
  },
  {
    title: "GTA 5",
    genre: "Action / Open World",
    image: "/images/gta5.jpg",
    players: "150M+",
    rating: 4.9,
  },
];

async function seedGames() {
  try {
    await connectDB();

    await Game.deleteMany({});

    await Game.insertMany(games);

    console.log("Games seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed games:", error);
    process.exit(1);
  }
}

seedGames();