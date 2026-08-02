import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Profile", path: "/profile", icon: "👤" },
    { name: "Tournaments", path: "/tournaments", icon: "🏆" },
    { name: "Friends", path: "/friends", icon: "👥" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="logo-circle">S</div>

        <h2>
          Squad<span>Up</span>
        </h2>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={
                location.pathname === item.path
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <span className="icon">{item.icon}</span>

              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-bottom">
        <Link to="/login" className="logout-btn">
          🚪 Logout
        </Link>
      </div>

    </aside>
  );
}

export default Sidebar;