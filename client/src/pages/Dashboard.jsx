import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCard from "../components/StatsCard";
import "../styles/statscard.css";
import ContinuePlaying from "../components/ContinuePlaying";
import TournamentCard from "../components/TournamentCard";
import FriendsOnline from "../components/FriendsOnline";
import RecentActivity from "../components/RecentActivity";
import UpcomingMatch from "../components/UpcomingMatch";
function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main className="dashboard-main">
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
<div className="dashboard-layout">

  <div className="left-dashboard">

    <ContinuePlaying />

    <RecentActivity />
    <UpcomingMatch />

  </div>


  <div className="right-dashboard">

    <TournamentCard />

    <FriendsOnline />

  </div>

</div>
  

  <div className="right-section">


   

  </div>


      </main>
    </div>
  );
}

export default Dashboard;