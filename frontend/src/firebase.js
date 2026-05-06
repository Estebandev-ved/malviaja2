import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChuAVMbX018EaA3KMo7Vn3-LIyd5_wK88",
  authDomain: "malviaja2-a5480.firebaseapp.com",
  projectId: "malviaja2-a5480",
  storageBucket: "malviaja2-a5480.firebasestorage.app",
  messagingSenderId: "1042682411745",
  appId: "1:1042682411745:web:b33ccb814ede1789f495a0",
  measurementId: "G-W13GW8JKKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
