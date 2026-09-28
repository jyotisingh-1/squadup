import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import { auth } from "../firebase/firebase";
import "../styles/games.css";

function Games() {
  const [games, setGames] = useState([]);
  const [selectedGameIds, setSelectedGameIds] = useState([]);
  const [initialSavedIds, setInitialSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // 1. Fetch available games from backend
  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("http://localhost:5000/api/games");

        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }

        const data = await response.json();
        setGames(data.games || []);
      } catch (err) {
        console.error("Failed to fetch games:", err);
        setFeedback({ type: "error", message: "Failed to load games list." });
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  // 2. Fetch authenticated user's selected games
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (!user) {
        setSelectedGameIds([]);
        setInitialSavedIds([]);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch("http://localhost:5000/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userObj = data.user || data;

          let loadedIds = [];
          if (Array.isArray(userObj.selectedGames) && userObj.selectedGames.length > 0) {
            loadedIds = userObj.selectedGames.map((g) => (typeof g === "string" ? g : g._id || g));
          } else {
            // Check local fallback storage for this user UID
            const cached = localStorage.getItem(`squadup_selected_games_${user.uid}`);
            if (cached) {
              try {
                loadedIds = JSON.parse(cached);
              } catch {
                loadedIds = [];
              }
            }
          }

          setSelectedGameIds(loadedIds);
          setInitialSavedIds(loadedIds);
        }
      } catch (err) {
        console.error("Failed to load user games:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Toggle selection for a game
  const handleToggleGame = (gameId) => {
    setSelectedGameIds((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  // Save selected games via PATCH /api/users/me/games
  const handleSaveSelection = async () => {
    if (!currentUser) {
      setFeedback({
        type: "error",
        message: "Please log in to save your game selections.",
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("http://localhost:5000/api/users/me/games", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameIds: selectedGameIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update selected games.");
      }

      // Cache locally as well
      localStorage.setItem(
        `squadup_selected_games_${currentUser.uid}`,
        JSON.stringify(selectedGameIds)
      );

      setInitialSavedIds(selectedGameIds);
      setFeedback({
        type: "success",
        message: "Selected games updated successfully! 🎉",
      });
    } catch (err) {
      console.error("Failed to update selected games:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to update selected games.",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges =
    JSON.stringify([...selectedGameIds].sort()) !==
    JSON.stringify([...initialSavedIds].sort());

  if (loading) {
    return (
      <div className="games-page">
        <div className="games-loading">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="games-page">
      <div className="games-container">
        <Link to="/dashboard" className="games-nav-back">
          ← Back to Dashboard
        </Link>

        <header className="games-header">
          <div className="games-title-group">
            <h1>🎮 Game Selection</h1>
            <p>Select your favorite games to personalize your squad matchmaking.</p>
          </div>

          <div className="games-actions">
            <span className="selection-count-badge">
              ⚡ {selectedGameIds.length} {selectedGameIds.length === 1 ? "Game" : "Games"} Selected
            </span>

            <button
              type="button"
              className="save-games-btn"
              onClick={handleSaveSelection}
              disabled={saving || !hasUnsavedChanges}
            >
              {saving ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "Saved"}
            </button>
          </div>
        </header>

        {feedback && (
          <div className={`feedback-banner ${feedback.type}`}>
            {feedback.type === "success" ? "✓" : "⚠️"} {feedback.message}
          </div>
        )}

        <div className="games-grid">
          {games.map((game) => (
            <GameCard
              key={game._id}
              id={game._id}
              image={game.image}
              title={game.title}
              genre={game.genre}
              players={game.players}
              selectable={true}
              isSelected={selectedGameIds.includes(game._id)}
              onToggle={handleToggleGame}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Games;