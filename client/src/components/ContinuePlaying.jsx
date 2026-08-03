import "./../styles/dashboard.css";

const games = [
  {
    title: "BGMI",
    genre: "Battle Royale",
    progress: 78,
    friends: "4 Friends Online",
  },
  {
    title: "Valorant",
    genre: "FPS Shooter",
    progress: 45,
    friends: "2 Friends Online",
  },
];

function ContinuePlaying() {
  return (
    <div className="continue-card">

      <h2>🎮 Continue Playing</h2>

      {games.map((game, index) => (
        <div className="continue-game" key={index}>

          <div className="game-info">
            <h3>{game.title}</h3>
            <p>{game.genre}</p>
            <span>{game.friends}</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${game.progress}%` }}
            ></div>
          </div>

          <button className="continue-btn">
            Continue
          </button>

        </div>
      ))}

    </div>
  );
}

export default ContinuePlaying;