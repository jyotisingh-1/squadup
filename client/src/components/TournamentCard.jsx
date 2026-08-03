import "../styles/dashboard.css";

function TournamentCard() {
  return (
    <div className="tournament-card">

      <div className="live-badge">
        🔴 LIVE
      </div>

      <h2>Weekend Championship</h2>

      <div className="game-tag">
        🎮 BGMI
      </div>

      <div className="tournament-row">
        <span>🏆 Prize Pool</span>
        <strong>₹25,000</strong>
      </div>

      <div className="tournament-row">
        <span>👥 Teams Joined</span>
        <strong>126 / 200</strong>
      </div>

      <div className="progress">

        <div className="progress-fill"></div>

      </div>

      <div className="tournament-row">
        <span>📍 Server</span>
        <strong>Mumbai</strong>
      </div>

      <div className="tournament-row">
        <span>👥 Team Size</span>
        <strong>Squad (4)</strong>
      </div>

      <div className="tournament-row">
        <span>⏰ Starts In</span>
        <strong>2 Days</strong>
      </div>

      <button className="join-btn">
        🚀 Join Tournament
      </button>

    </div>
  );
}

export default TournamentCard;