import React, { useState, useEffect } from "react";
import "../styles/navbar.css";
import { Link } from "react-router-dom";
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={scrolled ? "navbar scrolled" : "navbar"}>
      <div className="nav-container">
        {/* Logo */}
        <div className="logo">
          <div className="logo-circle">S</div>

          <div className="logo-text">
            Squad<span>Up</span>
          </div>
        </div>

        {/* Desktop Menu */}

        <ul className={menuOpen ? "nav-links active" : "nav-links"}>
          <li>
            <Link to="/">Home</Link>
          </li>

          <li>
            <a href="/">Games</a>
          </li>

          <li>
            <a href="/">Tournaments</a>
          </li>

          <li>
            <a href="/">Community</a>
          </li>

          <li>
            <a href="/">About</a>
          </li>
        </ul>

        {/* Buttons */}

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">
              Login
          </Link>

          <Link to="/signup" className="signup-btn">
              Signup
          </Link>

        </div>

        {/* Mobile */}

        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>
      </div>
    </header>
  );
}

export default Navbar;