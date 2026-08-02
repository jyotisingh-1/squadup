import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCard from "../components/StatsCard";
import "../styles/statscard.css";
function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main
        style={{
          marginLeft: "260px",
          width: "100%",
          minHeight: "100vh",
          background: "#050816",
          color: "white",
          padding: "35px 40px",
        }}
      >
        <Topbar />
        <div className="stats-grid">

  <StatsCard
    title="Games Played"
    value="284"
    icon="🎮"
    color="linear-gradient(135deg,#00E5FF,#2563EB)"
  />

  <StatsCard
    title="Wins"
    value="167"
    icon="🏆"
    color="linear-gradient(135deg,#FFD700,#FF8C00)"
  />

  <StatsCard
    title="Current Rank"
    value="#24"
    icon="⭐"
    color="linear-gradient(135deg,#8B5CF6,#EC4899)"
  />

  <StatsCard
    title="Squad Coins"
    value="9250"
    icon="💰"
    color="linear-gradient(135deg,#22C55E,#16A34A)"
  />

</div>
      </main>
    </div>
  );
}

export default Dashboard;