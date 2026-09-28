import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function ContinuePlaying() {
  const navigate = useNavigate();

  const actions = [
    { icon: "🎮", title: "Join Match", path: "/games" },
    { icon: "👥", title: "Find Squad", path: "/squads" },
    { icon: "🏆", title: "Tournament", path: "/tournaments" },
    { icon: "🎁", title: "Rewards", path: "/dashboard" },
  ];

  const handleClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="continue-card">
      <h2>⚡ Quick Actions</h2>

      <div className="quick-actions">
        {actions.map((item, index) => (
          <button
            className="action-btn"
            key={index}
            onClick={() => handleClick(item.path)}
          >
            <span>{item.icon}</span>
            <p>{item.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ContinuePlaying;