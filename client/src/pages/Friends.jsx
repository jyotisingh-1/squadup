import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/firebase";
import "../styles/friendsPage.css";

function Friends() {
  const [activeTab, setActiveTab] = useState("friends"); // 'friends' | 'requests' | 'discover'
  const [currentUser, setCurrentUser] = useState(null);

  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [discoverGamers, setDiscoverGamers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Load Firebase Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch all friend-related data
  const fetchData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [friendsRes, incomingRes, outgoingRes, discoverRes] =
        await Promise.all([
          fetch("http://localhost:5000/api/friends", { headers }),
          fetch("http://localhost:5000/api/friends/requests/incoming", { headers }),
          fetch("http://localhost:5000/api/friends/requests/outgoing", { headers }),
          fetch("http://localhost:5000/api/friends/discover", { headers }),
        ]);

      if (friendsRes.ok) {
        const d = await friendsRes.json();
        setFriends(d.friends || []);
      }

      if (incomingRes.ok) {
        const d = await incomingRes.json();
        setIncomingRequests(d.requests || []);
      }

      if (outgoingRes.ok) {
        const d = await outgoingRes.json();
        setOutgoingRequests(d.requests || []);
      }

      if (discoverRes.ok) {
        const d = await discoverRes.json();
        setDiscoverGamers(d.gamers || []);
      }
    } catch (err) {
      console.error("Failed to load friends data:", err);
      setFeedback({ type: "error", message: "Failed to load friends data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Send Friend Request
  const handleSendRequest = async (recipientId) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/friends/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send friend request.");
      }

      setFeedback({ type: "success", message: data.message || "Friend request sent!" });
      fetchData();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error sending request." });
    }
  };

  // Accept Friend Request
  const handleAcceptRequest = async (requestId) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `http://localhost:5000/api/friends/requests/${requestId}/accept`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to accept request.");
      }

      setFeedback({ type: "success", message: "Friend request accepted! 🎉" });
      fetchData();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error accepting request." });
    }
  };

  // Reject Friend Request
  const handleRejectRequest = async (requestId) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `http://localhost:5000/api/friends/requests/${requestId}/reject`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reject request.");
      }

      setFeedback({ type: "success", message: "Friend request rejected." });
      fetchData();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error rejecting request." });
    }
  };

  // Cancel Outgoing Request
  const handleCancelRequest = async (requestId) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `http://localhost:5000/api/friends/requests/${requestId}/cancel`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel request.");
      }

      setFeedback({ type: "success", message: "Friend request cancelled." });
      fetchData();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error cancelling request." });
    }
  };

  // Remove Friend / Unfriend
  const handleRemoveFriend = async (friendshipId, friendName) => {
    if (!currentUser) return;
    if (!window.confirm(`Are you sure you want to remove ${friendName} as a friend?`)) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`http://localhost:5000/api/friends/${friendshipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove friend.");
      }

      setFeedback({ type: "success", message: "Friend removed." });
      fetchData();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: err.message || "Error removing friend." });
    }
  };

  // Filtered Friends
  const filteredFriends = friends.filter((item) => {
    const f = item.friend;
    if (!f) return false;
    const q = searchQuery.toLowerCase();
    return (
      (f.fullName && f.fullName.toLowerCase().includes(q)) ||
      (f.username && f.username.toLowerCase().includes(q))
    );
  });

  // Filtered Discover Gamers
  const filteredDiscover = discoverGamers.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      (g.fullName && g.fullName.toLowerCase().includes(q)) ||
      (g.username && g.username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="friends-page-container">
      <div className="friends-page-inner">
        <Link to="/dashboard" className="friends-page-nav-back">
          ← Back to Dashboard
        </Link>

        {/* HEADER */}
        <header className="friends-page-header">
          <div className="friends-page-title-group">
            <h1>👥 Friends & Community</h1>
            <p>Connect with players, build your squad, and coordinate matches.</p>
          </div>
        </header>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div className={`friends-feedback-banner ${feedback.type}`}>
            {feedback.type === "success" ? "✓" : "⚠️"} {feedback.message}
          </div>
        )}

        {/* UNAUTHENTICATED NOTICE */}
        {!currentUser && !loading && (
          <div className="friends-empty">
            <span className="friends-empty-icon">🔒</span>
            <h3>Authentication Required</h3>
            <p>Please log in to manage your friends and friend requests.</p>
            <Link
              to="/login"
              className="btn-add-friend"
              style={{ width: "auto", padding: "10px 24px", marginTop: "12px" }}
            >
              Go to Login
            </Link>
          </div>
        )}

        {currentUser && (
          <>
            {/* TABS */}
            <div className="friends-tabs">
              <button
                type="button"
                className={`friends-tab-btn ${activeTab === "friends" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("friends");
                  setSearchQuery("");
                }}
              >
                🎮 Friends
                <span className="tab-badge">{friends.length}</span>
              </button>

              <button
                type="button"
                className={`friends-tab-btn ${activeTab === "requests" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("requests");
                  setSearchQuery("");
                }}
              >
                📬 Requests
                {incomingRequests.length > 0 ? (
                  <span className="tab-badge highlight">{incomingRequests.length}</span>
                ) : (
                  <span className="tab-badge">{outgoingRequests.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`friends-tab-btn ${activeTab === "discover" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("discover");
                  setSearchQuery("");
                }}
              >
                🔍 Find Gamers
                <span className="tab-badge">{discoverGamers.length}</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. FRIENDS LIST */}
            {activeTab === "friends" && (
              <div>
                <div className="friends-search-bar">
                  <input
                    type="text"
                    className="friends-search-input"
                    placeholder="Search your friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="friends-loading">Loading friends...</div>
                ) : filteredFriends.length === 0 ? (
                  <div className="friends-empty">
                    <span className="friends-empty-icon">🤝</span>
                    <h3>No Friends Found</h3>
                    <p>
                      {friends.length === 0
                        ? "You haven't added any friends yet. Check out the 'Find Gamers' tab to connect!"
                        : "No friends match your search query."}
                    </p>
                  </div>
                ) : (
                  <div className="friends-grid">
                    {filteredFriends.map(({ friendshipId, friend, since }) => (
                      <div key={friendshipId} className="gamer-card">
                        <div>
                          <div className="gamer-card-header">
                            <div className="gamer-avatar">
                              {(friend.username || friend.fullName || "G")[0].toUpperCase()}
                            </div>
                            <div className="gamer-meta">
                              <span className="gamer-name">
                                {friend.fullName || "Gamer"}
                              </span>
                              <span className="gamer-handle">
                                {friend.username ? `@${friend.username}` : friend.email}
                              </span>
                            </div>
                          </div>

                          <p className="gamer-bio">
                            {friend.bio || "Fellow squadmate ready to game."}
                          </p>
                        </div>

                        <div className="gamer-footer">
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#718096",
                              marginRight: "auto",
                            }}
                          >
                            Friends since {new Date(since).toLocaleDateString()}
                          </span>

                          <button
                            type="button"
                            className="btn-unfriend"
                            onClick={() =>
                              handleRemoveFriend(
                                friendshipId,
                                friend.fullName || friend.username || "this friend"
                              )
                            }
                          >
                            Unfriend
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. REQUESTS */}
            {activeTab === "requests" && (
              <div>
                {/* Incoming Requests */}
                <h3 className="section-sub-header">
                  📥 Incoming Requests ({incomingRequests.length})
                </h3>

                {incomingRequests.length === 0 ? (
                  <div className="friends-empty" style={{ minHeight: "18vh", marginBottom: "28px" }}>
                    <p>No incoming friend requests right now.</p>
                  </div>
                ) : (
                  <div className="friends-grid" style={{ marginBottom: "32px" }}>
                    {incomingRequests.map((req) => (
                      <div key={req._id} className="gamer-card">
                        <div>
                          <div className="gamer-card-header">
                            <div className="gamer-avatar">
                              {(req.requester?.username ||
                                req.requester?.fullName ||
                                "G")[0].toUpperCase()}
                            </div>
                            <div className="gamer-meta">
                              <span className="gamer-name">
                                {req.requester?.fullName || "Gamer"}
                              </span>
                              <span className="gamer-handle">
                                {req.requester?.username
                                  ? `@${req.requester.username}`
                                  : req.requester?.email}
                              </span>
                            </div>
                          </div>

                          <p className="gamer-bio">
                            {req.requester?.bio || "Wants to add you as a squad friend!"}
                          </p>
                        </div>

                        <div className="gamer-footer">
                          <button
                            type="button"
                            className="btn-accept"
                            onClick={() => handleAcceptRequest(req._id)}
                          >
                            ✓ Accept
                          </button>
                          <button
                            type="button"
                            className="btn-reject"
                            onClick={() => handleRejectRequest(req._id)}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Outgoing Requests */}
                <h3 className="section-sub-header">
                  📤 Sent Requests ({outgoingRequests.length})
                </h3>

                {outgoingRequests.length === 0 ? (
                  <div className="friends-empty" style={{ minHeight: "18vh" }}>
                    <p>No outgoing pending requests.</p>
                  </div>
                ) : (
                  <div className="friends-grid">
                    {outgoingRequests.map((req) => (
                      <div key={req._id} className="gamer-card">
                        <div>
                          <div className="gamer-card-header">
                            <div className="gamer-avatar">
                              {(req.recipient?.username ||
                                req.recipient?.fullName ||
                                "G")[0].toUpperCase()}
                            </div>
                            <div className="gamer-meta">
                              <span className="gamer-name">
                                {req.recipient?.fullName || "Gamer"}
                              </span>
                              <span className="gamer-handle">
                                {req.recipient?.username
                                  ? `@${req.recipient.username}`
                                  : req.recipient?.email}
                              </span>
                            </div>
                          </div>

                          <p className="gamer-bio">
                            {req.recipient?.bio || "Request sent. Waiting for response."}
                          </p>
                        </div>

                        <div className="gamer-footer">
                          <span className="btn-status-pill pending">
                            ⏳ Pending
                          </span>
                          <button
                            type="button"
                            className="btn-reject"
                            onClick={() => handleCancelRequest(req._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. FIND GAMERS */}
            {activeTab === "discover" && (
              <div>
                <div className="friends-search-bar">
                  <input
                    type="text"
                    className="friends-search-input"
                    placeholder="Search gamers by name or @username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="friends-loading">Discovering gamers...</div>
                ) : filteredDiscover.length === 0 ? (
                  <div className="friends-empty">
                    <span className="friends-empty-icon">🔍</span>
                    <h3>No Gamers Found</h3>
                    <p>No other players matched your search.</p>
                  </div>
                ) : (
                  <div className="friends-grid">
                    {filteredDiscover.map((gamer) => (
                      <div key={gamer._id} className="gamer-card">
                        <div>
                          <div className="gamer-card-header">
                            <div className="gamer-avatar">
                              {(gamer.username || gamer.fullName || "G")[0].toUpperCase()}
                            </div>
                            <div className="gamer-meta">
                              <span className="gamer-name">
                                {gamer.fullName || "Gamer"}
                              </span>
                              <span className="gamer-handle">
                                {gamer.username ? `@${gamer.username}` : gamer.email}
                              </span>
                            </div>
                          </div>

                          <p className="gamer-bio">
                            {gamer.bio || "Active gamer on SquadUp looking to squad up!"}
                          </p>
                        </div>

                        <div className="gamer-footer">
                          {gamer.relationship === "friends" ? (
                            <span className="btn-status-pill friends">
                              ✓ Friends
                            </span>
                          ) : gamer.relationship === "pending_sent" ? (
                            <span className="btn-status-pill pending">
                              ⏳ Request Sent
                            </span>
                          ) : gamer.relationship === "pending_received" ? (
                            <button
                              type="button"
                              className="btn-accept"
                              onClick={() => {
                                setActiveTab("requests");
                              }}
                            >
                              Respond to Request
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-add-friend"
                              onClick={() => handleSendRequest(gamer._id)}
                            >
                              ⚡ Add Friend
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Friends;