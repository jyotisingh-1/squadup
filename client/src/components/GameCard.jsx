import "../styles/gamecard.css";
import { FaUsers, FaStar, FaPlay } from "react-icons/fa";

function GameCard({ image, title, genre, players }) {
  return (
    <div className="game-card">

      <img src={image} alt={title} className="game-image" />

      <div className="game-overlay">

        <div className="live-badge">
          🔥 LIVE
        </div>

        <div className="game-info">

          <span className="genre">{genre}</span>

          <h3>{title}</h3>

          <div className="game-stats">

            <span>
              <FaUsers />
              {players}
            </span>

            <span>
              <FaStar />
              4.9
            </span>

          </div>

          <button className="play-btn">

            <FaPlay />

            Play Now

          </button>

        </div>

      </div>

    </div>
  );
}

export default GameCard;