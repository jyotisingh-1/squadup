import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Games", path: "/games", icon: "🎮" },
    { name: "Squads", path: "/squads", icon: "⚡" },
    { name: "Profile", path: "/profile", icon: "👤" },
    { name: "Tournaments", path: "/tournaments", icon: "🏆" },
    { name: "Friends", path: "/friends", icon: "👥" },
    { name: "Chat", path: "/chat", icon: "💬" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];
  const navigate = useNavigate();
  const handleLogout = async () => {
  try {
    await signOut(auth);
    navigate("/login");
  } catch (error) {
    console.log(error);
  }
};

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
        <button 
          className="logout-btn"
          onClick={handleLogout}
          >
          🚪 Logout
          </button>
      </div>

    </aside>
  );
}

export default Sidebar;
