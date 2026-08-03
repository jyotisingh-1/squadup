import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";


function useUser(){

  const [userData,setUserData] = useState(null);


  useEffect(()=>{

    const fetchUser = async()=>{

      const user = auth.currentUser;

      if(user){

        const userRef = doc(db,"users",user.uid);

        const snapshot = await getDoc(userRef);


        if(snapshot.exists()){

          setUserData(snapshot.data());

        }

      }

    };


    fetchUser();


  },[]);


  return userData;

}


export default useUser;