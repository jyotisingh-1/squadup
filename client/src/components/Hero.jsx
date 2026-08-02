import "../styles/hero.css";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-bg"></div>

      <div className="hero-container">

        {/* LEFT */}

        <div className="hero-left">

          <span className="hero-badge">
            🔥 India's Ultimate Gaming Community
          </span>

          <h1>
            Find Your <span>Perfect Squad</span>
          </h1>

          <p>
            Discover teammates, join tournaments,
            create your dream squad and compete
            with gamers from all over India.
          </p>

          <div className="hero-buttons">

            <Link to="/login">
              <button className="primary-btn">
                Get Started
              </button>
            </Link>

            <Link to="/signup">
              <button className="secondary-btn">
                Create Account
              </button>
            </Link>

          </div>

          <div className="hero-stats">

            <div className="stat-card">
              <h2>250K+</h2>
              <span>Players</span>
            </div>

            <div className="stat-card">
              <h2>80+</h2>
              <span>Games</span>
            </div>

            <div className="stat-card">
              <h2>12K+</h2>
              <span>Tournaments</span>
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="hero-right">

          <div className="hero-card">

            <div className="card-header">

              <span className="live-dot"></span>

              <p>LIVE MATCH</p>

            </div>

            <div className="game-icon">
              🎮
            </div>

            <h3>BGMI Championship</h3>

            <p>
              Squad Battle • Erangel
            </p>

            <button className="join-btn">
              Join Tournament →
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;