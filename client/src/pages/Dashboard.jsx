import React from "react";
import Sidebar from "../components/Sidebar";

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
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px",
          }}
        >
          Welcome Back, Jyoti 👋
        </h1>

        <p
          style={{
            color: "#9fb3cf",
            fontSize: "18px",
          }}
        >
          Your gaming dashboard is ready.
        </p>
      </main>
    </div>
  );
}

export default Dashboard;