import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-left">

          <h2>🎮 SquadUp</h2>

          <p>
            India's ultimate platform to find teammates,
            join tournaments and build your dream squad.
          </p>

        </div>

        <div className="footer-links">

          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="/">Games</a>
          <a href="/">Tournaments</a>
          <a href="/">Contact</a>

        </div>

        <div className="footer-social">

          <h3>Follow Us</h3>

          <div className="social-icons">

            <span>🎮</span>
            <span>💬</span>
            <span>📷</span>
            <span>▶️</span>

          </div>

        </div>

      </div>

      <div className="copyright">
        © 2026 SquadUp. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;