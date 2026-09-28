import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaArrowRight } from "react-icons/fa";
import "../styles/friends.css";

function FriendsOnline() {
  const navigate = useNavigate();
  const friends = [
    {
      name: "Riya",
      game: "Valorant",
      initial: "R",
    },
    {
      name: "Aman",
      game: "BGMI",
      initial: "A",
    },
    {
      name: "Kunal",
      game: "Free Fire",
      initial: "K",
    },
  ];

  const squad = [
    { name: "Riya", initial: "R" },
    { name: "Aman", initial: "A" },
    { name: "Kunal", initial: "K" },
    { name: "You", initial: "Y" },
  ];

  return (
    <div className="friends-card">

      {/* HEADER */}
      <div className="friends-header">
        <div>
          <span className="friends-kicker">COMMUNITY</span>
          <h2>Friends & Squad</h2>
        </div>

        <button
          className="friends-view-btn"
          onClick={() => navigate("/friends")}
        >
          View All <FaArrowRight />
        </button>
      </div>

      {/* ONLINE FRIENDS */}
      <div className="friends-list">
        {friends.map((friend) => (
          <div className="friend" key={friend.name}>
            <div className="avatar">{friend.initial}</div>

            <div>
              <h4>{friend.name}</h4>
              <p>Playing {friend.game}</p>
            </div>

            <span className="online-dot"></span>
          </div>
        ))}
      </div>

      {/* YOUR SQUAD */}
      <div className="your-squad">
        <div className="squad-title">
          <span>YOUR SQUAD</span>
          <small>4 MEMBERS</small>
        </div>

        <div className="squad-members">
          {squad.map((member, index) => (
            <div
              className={`squad-member ${index === squad.length - 1 ? "current-user" : ""}`}
              key={member.name}
              title={member.name}
            >
              <div className="squad-avatar">{member.initial}</div>

              {index < squad.length - 1 && (
                <span className="squad-online"></span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FIND SQUAD */}
      <button className="find-squad-btn">
        <FaPlus />
        Find More Squad Members
        <FaArrowRight className="find-arrow" />
      </button>
    </div>
  );
}

export default FriendsOnline;