import "../styles/dashboard.css";

const friends = [
  {
    name: "Rohit",
    game: "Playing BGMI",
  },
  {
    name: "Ankit",
    game: "Playing Valorant",
  },
  {
    name: "Neha",
    game: "In Lobby",
  },
];

function FriendsOnline() {
  return (
    <div className="friends-card">

      <h2>👥 Friends Online</h2>

      {friends.map((friend, index) => (
        <div className="friend" key={index}>

          <div className="avatar">
            {friend.name.charAt(0)}
          </div>

          <div>
            <h4>{friend.name}</h4>
            <p>{friend.game}</p>
          </div>

          <div className="online-dot"></div>

        </div>
      ))}

    </div>
  );
}

export default FriendsOnline;