import "../styles/dashboard.css";

function TournamentCard() {
  return (
    <div className="tournament-card">

      <h2>🏆 Tournament</h2>

      <h3>Weekend Championship</h3>

      <div className="tournament-info">

        <div>
          <span>Prize Pool</span>
          <h4>₹25,000</h4>
        </div>

        <div>
          <span>Players</span>
          <h4>126 / 200</h4>
        </div>

        <div>
          <span>Starts In</span>
          <h4>2 Days</h4>
        </div>

      </div>

      <button className="join-btn">
        Join Tournament
      </button>

    </div>
  );
}

export default TournamentCard;