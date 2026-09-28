import Game from "../models/Game.js";

export async function getGames(req, res) {
  try {
    const games = await Game.find().sort({ title: 1 });

    return res.status(200).json({
      games,
    });
  } catch (error) {
    console.error("Failed to fetch games:", error);

    return res.status(500).json({
      message: "Failed to fetch games",
    });
  }
}