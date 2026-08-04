import useUser from "../hooks/useUser";
import "../styles/profile.css";
import { useState } from "react";
import EditProfileModal from "../components/EditProfileModal";
function Profile() {

  const userData = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (

    <div className="profile-page">

      <div className="profile-card">


        <div className="profile-avatar">
          🎮
        </div>


        <h1>
          {userData?.fullName || "Gamer"}
        </h1>

        <p className="profile-email">
          {userData?.email || "email@example.com"}
        </p>



        <div className="profile-stats">


          <div className="profile-stat">
            <h2>284</h2>
            <span>Games Played</span>
          </div>


          <div className="profile-stat">
            <h2>167</h2>
            <span>Wins</span>
          </div>


          <div className="profile-stat">
            <h2>#24</h2>
            <span>Rank</span>
          </div>


          <div className="profile-stat">
            <h2>9250</h2>
            <span>Coins</span>
          </div>


        </div>


        <button
        className="edit-profile"
         onClick={() => setIsModalOpen(true)}
          >
           Edit Profile
        </button>


      </div>

    <EditProfileModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
    </div>

  );
}


export default Profile;