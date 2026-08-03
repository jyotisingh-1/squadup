import "../styles/dashboard.css";

function RecentActivity() {
  const activities = [
    {
      icon: "🏆",
      title: "Won BGMI Tournament",
      time: "2 hours ago",
      color: "#FFD700",
    },
    {
      icon: "👥",
      title: "Rohit joined your squad",
      time: "5 hours ago",
      color: "#00E5FF",
    },
    {
      icon: "🎮",
      title: "Reached Diamond Rank",
      time: "Yesterday",
      color: "#8B5CF6",
    },
    {
      icon: "💰",
      title: "Earned 500 Squad Coins",
      time: "2 days ago",
      color: "#22C55E",
    },
  ];

  return (
    <div className="recent-card">

      <h2>📈 Recent Activity</h2>

      {activities.map((item, index) => (
        <div className="activity-item" key={index}>

          <div
            className="activity-icon"
            style={{ background: item.color }}
          >
            {item.icon}
          </div>

          <div className="activity-content">
            <h4>{item.title}</h4>
            <span>{item.time}</span>
          </div>

        </div>
      ))}

    </div>
  );
}

export default RecentActivity;