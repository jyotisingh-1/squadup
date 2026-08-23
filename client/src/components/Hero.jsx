import "../styles/hero.css";
import { Link } from "react-router-dom";
import HolographicController from "./HolographicController";
function Hero() {
  return (
    <section className="hero">

      <div className="hero-bg"></div>

      <div className="hero-container">

        {/* LEFT */}

        <div className="hero-left">

          <span className="hero-badge">
            • NEXT-GEN GAMING PLATFORM
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

          <HolographicController />

        </div>

      </div>

    </section>
  );
}

export default Hero;