import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/firebase";
import "../styles/squads.css";

const ROLE_OPTIONS = [
  "Any / Flex",
  "Assault / Fragger",
  "Sniper / Marksman",
  "Support / Anchor",
  "IGL / Shotcaller",
];

function Squads() {
  const [squads, setSquads] = useState([]);
  const [games, setGames] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilterGame, setSelectedFilterGame] = useState("all");

  // Form State
  const [formGameId, setFormGameId] = useState("");
  const [formRole, setFormRole] = useState(ROLE_OPTIONS[0]);
  const [formDesc, setFormDesc] = useState("");
  const [formMaxMembers, setFormMaxMembers] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch available games
  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch("http://localhost:5000/api/games");
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (err) {
        console.error("Failed to fetch games list:", err);
      }
    }
    fetchGames();
  }, []);

  // 2. Fetch authenticated user data & selected games
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user || data);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Fetch squad posts
  const fetchSquads = async () => {
    try {
      setLoading(true);
      const url =
        selectedFilterGame && selectedFilterGame !== "all"
          ? `http://localhost:5000/api/squads?gameId=${selectedFilterGame}`
          : "http://localhost:5000/api/squads";

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSquads(data.squads || []);
      } else {
        throw new Error("Failed to fetch squads");
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Failed to load squad posts." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, [selectedFilterGame]);

  // User's selected games (or all games if none selected)
  const userEligibleGames = useMemo(() => {
    if (!games.length) return [];

    let selectedIds = [];
    if (userProfile?.selectedGames && Array.isArray(userProfile.selectedGames)) {
      selectedIds = userProfile.selectedGames.map((g) =>
        typeof g === "string" ? g : g._id || g
      );
    } else if (currentUser) {
      const cached = localStorage.getItem(
        `squadup_selected_games_${currentUser.uid}`
      );
      if (cached) {
        try {
          selectedIds = JSON.parse(cached);
        } catch {
          selectedIds = [];
        }
      }
    }

    if (selectedIds.length > 0) {
      const filtered = games.filter((g) => selectedIds.includes(g._id));
      if (filtered.length > 0) return filtered;
    }

    return games;
  }, [games, userProfile, currentUser]);

  // Set default game selection in modal
  useEffect(() => {
    if (userEligibleGames.length > 0 && !formGameId) {
      setFormGameId(userEligibleGames[0]._id);
    }
  }, [userEligibleGames, formGameId]);

  // Handle Create Squad Submit
  const handleCreateSquad = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setFeedback({ type: "error", message: "Please log in to create a squad post." });
      return;
    }

    if (!formGameId) {
      setFeedback({ type: "error", message: "Please select a game." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/squads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: formGameId,
          role: formRole,
          description: formDesc.trim(),
          maxMembers: formMaxMembers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create squad.");
      }

      setFeedback({ type: "success", message: data.message || "Squad created! 🚀" });
      setIsModalOpen(false);
      setFormDesc("");

      // Refresh squad list
      fetchSquads();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error creating squad post." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Join Squad
  const handleJoinSquad = async (squadId) => {
    if (!currentUser) {
      setFeedback({ type: "error", message: "Please log in to join a squad." });
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/squads/${squadId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to join squad.");
      }

      setFeedback({ type: "success", message: data.message || "Joined squad! 🎉" });
      fetchSquads();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error joining squad." });
    }
  };

  // Handle Leave Squad
  const handleLeaveSquad = async (squadId) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/squads/${squadId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to leave squad.");
      }

      setFeedback({ type: "success", message: data.message || "Left the squad." });
      fetchSquads();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error leaving squad." });
    }
  };

  // Handle Delete Squad (by Creator)
  const handleDeleteSquad = async (squadId) => {
    if (!currentUser) return;
    if (!window.confirm("Are you sure you want to cancel this squad post?")) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/squads/${squadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete squad.");
      }

      setFeedback({ type: "success", message: "Squad post cancelled successfully." });
      fetchSquads();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error deleting squad." });
    }
  };

  return (
    <div className="squads-page">
      <div className="squads-container">
        <Link to="/dashboard" className="squads-nav-back">
          ← Back to Dashboard
        </Link>

        {/* HEADER */}
        <header className="squads-header">
          <div className="squads-title-group">
            <h1>👥 Looking for Squad</h1>
            <p>Find teammates, build your dream squad, and dominate the leaderboards.</p>
          </div>

          <button
            type="button"
            className="create-squad-btn"
            onClick={() => {
              if (!currentUser) {
                setFeedback({
                  type: "error",
                  message: "Please log in first to create a squad post.",
                });
                return;
              }
              setIsModalOpen(true);
            }}
          >
            ⚡ Create Squad Post
          </button>
        </header>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div className={`feedback-banner ${feedback.type}`}>
            {feedback.type === "success" ? "✓" : "⚠️"} {feedback.message}
          </div>
        )}

        {/* FILTERS BAR */}
        <div className="squads-filters-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#8fa0c0" }}>Filter Game:</span>
            <select
              className="game-filter-select"
              value={selectedFilterGame}
              onChange={(e) => setSelectedFilterGame(e.target.value)}
            >
              <option value="all">🎮 All Games</option>
              {games.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <span className="squads-count-badge">
            ⚡ {squads.length} {squads.length === 1 ? "Squad" : "Squads"} Available
          </span>
        </div>

        {/* SQUADS GRID */}
        {loading ? (
          <div className="squads-loading">Loading squad requests...</div>
        ) : squads.length === 0 ? (
          <div className="squads-empty">
            <span className="squads-empty-icon">🎮</span>
            <h3>No Squad Posts Found</h3>
            <p>
              {selectedFilterGame !== "all"
                ? "No active squads for this game yet. Be the first to create one!"
                : "No active squads right now. Create a post to recruit teammates!"}
            </p>
          </div>
        ) : (
          <div className="squads-grid">
            {squads.map((squad) => {
              const currentUserId = userProfile?.id || userProfile?._id;
              const isCreator =
                currentUser &&
                (squad.creator?._id === currentUserId ||
                  squad.creator?.id === currentUserId);

              const isMember =
                currentUser &&
                squad.members?.some(
                  (m) =>
                    (typeof m === "string" ? m : m._id || m.id) === currentUserId
                );

              const memberCount = squad.members?.length || 1;
              const isFull = squad.status === "full" || memberCount >= squad.maxMembers;

              return (
                <div key={squad._id} className="squad-card">
                  <div>
                    <div className="squad-card-top">
                      <span className="squad-game-tag">
                        🎮 {squad.game?.title || "Game"}
                      </span>
                      <span
                        className={`squad-status-pill ${
                          isFull ? "full" : "open"
                        }`}
                      >
                        {isFull ? "Full" : "Open"}
                      </span>
                    </div>

                    <div className="squad-creator-info">
                      <div className="squad-avatar">
                        {(squad.creator?.username ||
                          squad.creator?.fullName ||
                          "G")[0].toUpperCase()}
                      </div>
                      <div className="squad-creator-meta">
                        <span className="squad-creator-name">
                          {squad.creator?.username
                            ? `@${squad.creator.username}`
                            : squad.creator?.fullName || "Gamer"}
                        </span>
                        <span className="squad-time">
                          {new Date(squad.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="squad-role-badge">
                      🎯 Role: {squad.role || "Any"}
                    </div>

                    <p className="squad-desc">
                      {squad.description || "Looking for players to team up with!"}
                    </p>
                  </div>

                  <div>
                    <div className="squad-members-row">
                      <span className="squad-members-count">
                        👥 {memberCount} / {squad.maxMembers} Members
                      </span>
                      {isCreator && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#00f5ff",
                            fontWeight: "600",
                          }}
                        >
                          (Your Post)
                        </span>
                      )}
                    </div>

                    <div className="squad-action-row">
                      {isCreator ? (
                        <button
                          type="button"
                          className="squad-delete-btn"
                          style={{ width: "100%" }}
                          onClick={() => handleDeleteSquad(squad._id)}
                        >
                          ✕ Cancel Post
                        </button>
                      ) : isMember ? (
                        <>
                          <button
                            type="button"
                            className="squad-join-btn joined"
                            disabled
                          >
                            ✓ Joined
                          </button>
                          <button
                            type="button"
                            className="squad-leave-btn"
                            onClick={() => handleLeaveSquad(squad._id)}
                          >
                            Leave
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="squad-join-btn"
                          disabled={isFull}
                          onClick={() => handleJoinSquad(squad._id)}
                        >
                          {isFull ? "Squad Full" : "⚡ Join Squad"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE SQUAD MODAL */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>⚡ Create Squad Post</h2>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSquad} className="squad-form">
                <div className="form-group">
                  <label>Select Game *</label>
                  <select
                    value={formGameId}
                    onChange={(e) => setFormGameId(e.target.value)}
                    required
                  >
                    {userEligibleGames.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.title} ({g.genre})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Role Needed</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Max Squad Members (including you)</label>
                  <select
                    value={formMaxMembers}
                    onChange={(e) => setFormMaxMembers(Number(e.target.value))}
                  >
                    <option value={2}>2 (Duo)</option>
                    <option value={3}>3 (Trio)</option>
                    <option value={4}>4 (Full Squad)</option>
                    <option value={5}>5 (5-Stack)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description / Requirements</label>
                  <textarea
                    placeholder="e.g., Push to Diamond! Mic required, playing tonight."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    maxLength={300}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Posting..." : "Post Squad"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Squads;
