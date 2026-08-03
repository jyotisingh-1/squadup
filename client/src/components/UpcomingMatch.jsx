import "../styles/dashboard.css";

function UpcomingMatch() {
  return (
    <div className="upcoming-card">

      <h2>🔥 Upcoming Match</h2>

      <div className="match-game">
        BGMI Championship
      </div>

      <div className="match-details">

        <div>
          <span>Date</span>
          <h4>Today</h4>
        </div>

        <div>
          <span>Time</span>
          <h4>8:00 PM</h4>
        </div>

        <div>
          <span>Map</span>
          <h4>Erangel</h4>
        </div>

      </div>

      <button className="join-btn">
        Join Match
      </button>

    </div>
  );
}

export default UpcomingMatch;