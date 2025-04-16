// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOqeiEZOiiqCxn_NvV8X6tbzcc03oX8BU",
  authDomain: "chatapp-a3a1e.firebaseapp.com",
  projectId: "chatapp-a3a1e",
  storageBucket: "chatapp-a3a1e.firebasestorage.app",
  messagingSenderId: "32199977795",
  appId: "1:32199977795:web:5f79e72e2257e976ae1df6",
  measurementId: "G-ZV4ZWGS46V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
