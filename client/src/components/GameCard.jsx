import "../styles/gamecard.css";
import { FaUsers, FaStar, FaPlay, FaCheck, FaPlus } from "react-icons/fa";

function GameCard({
  image,
  title,
  genre,
  players,
  id,
  isSelected = false,
  onToggle,
  selectable = false,
}) {
  const handleCardClick = () => {
    if (selectable && onToggle) {
      onToggle(id);
    }
  };

  return (
    <div
      className={`game-card ${selectable ? "selectable" : ""} ${isSelected ? "selected" : ""}`}
      onClick={selectable ? handleCardClick : undefined}
    >
      <img src={image} alt={title} className="game-image" />

      <div className="game-overlay">
        <div className="game-card-header">
          <div className="live-badge">🔥 LIVE</div>
          {selectable && isSelected && (
            <div className="selected-badge">
              <FaCheck /> Selected
            </div>
          )}
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

          {selectable ? (
            <button
              type="button"
              className={`play-btn select-btn ${isSelected ? "selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggle) onToggle(id);
              }}
            >
              {isSelected ? (
                <>
                  <FaCheck /> Selected
                </>
              ) : (
                <>
                  <FaPlus /> Select Game
                </>
              )}
            </button>
          ) : (
            <button className="play-btn">
              <FaPlay />
              Play Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCard;