import { X } from "lucide-react";
import "../styles/editProfileModal.css";
import useUser from "../hooks/useUser";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";

function EditProfileModal({ isOpen, onClose }) {

  const userData = useUser();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || "");
      setUsername(userData.username || "");
      setBio(userData.bio || "");
    }
  }, [userData]);

  const handleSave = async (e) => {
  e.preventDefault();

  try {
    const user = auth.currentUser;

    if (!user) {
      alert("User not found.");
      return;
    }

    const token = await user.getIdToken();

    const response = await fetch(
      "http://localhost:5000/api/users/me",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          bio: bio.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile.");
    }

    alert("Profile updated successfully! 🎉");

    onClose();
    window.location.reload();

  } catch (error) {
    console.error("Profile update error:", error);
    alert(error.message || "Failed to update profile.");
  }
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">

      <div className="edit-modal">

        <div className="modal-header">

          <h2>Edit Profile</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={22} />
          </button>

        </div>

        <form onSubmit={handleSave}>

          <label>Full Name</label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
          />

          <label>Username</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
          />

          <label>Bio</label>

          <textarea
            rows="4"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell everyone about yourself..."
          />

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              Save Changes
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditProfileModal;