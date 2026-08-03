import "../styles/dashboard.css";

function ContinuePlaying() {
  const actions = [
    { icon: "🎮", title: "Join Match" },
    { icon: "👥", title: "Find Squad" },
    { icon: "🏆", title: "Tournament" },
    { icon: "🎁", title: "Rewards" },
  ];

  return (
    <div className="continue-card">
      <h2>⚡ Quick Actions</h2>

      <div className="quick-actions">
        {actions.map((item, index) => (
          <button className="action-btn" key={index}>
            <span>{item.icon}</span>
            <p>{item.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ContinuePlaying;