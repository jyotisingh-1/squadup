import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBFAidLe_7qtJnm2wY6Z2j99beBDF6KJDg",
  authDomain: "squadup-71065.firebaseapp.com",
  projectId: "squadup-71065",
  storageBucket: "squadup-71065.firebasestorage.app",
  messagingSenderId: "22871854666",
  appId: "1:22871854666:web:4b4dd6edde5072e20f60b3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);