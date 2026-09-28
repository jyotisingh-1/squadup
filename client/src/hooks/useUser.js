import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";

function useUser() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUserData(null);
        return;
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch(
          "http://localhost:5000/api/users/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        setUserData(data.user || data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return userData;
}

export default useUser;