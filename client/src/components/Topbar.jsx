import React from "react";
import "../styles/topbar.css";
import useUser from "../hooks/useUser";
function Topbar() {
  const userData = useUser();
  return (
    <div className="topbar">

      <div className="topbar-left">
        Welcome Back {userData?.fullName || "Gamer"} 👋
        <p>Ready to dominate today's matches?</p>
      </div>

      <div className="topbar-right">

        <div className="search-box">
          <input
            type="text"
            placeholder="Search games..."
          />
        </div>

        <button className="notification-btn">
          🔔
        </button>

        <div className="profile-box">
          <img
            src="https://i.pravatar.cc/100"
            alt="Profile"
          />
        </div>

      </div>

    </div>
  );
}

export default Topbar;