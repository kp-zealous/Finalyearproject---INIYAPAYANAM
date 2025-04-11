// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6NVrPz3jJqw2DV6AySw9BEJ8oKUnrKsA",
  authDomain: "iniyapayanam-7a79c.firebaseapp.com",
  projectId: "iniyapayanam-7a79c",
  storageBucket: "iniyapayanam-7a79c.appspot.com",
  messagingSenderId: "966473442865",
  appId: "1:966473442865:web:6a401b08897dd07b2e1710",
  measurementId: "G-YC10XTJX5H"
};

const app = initializeApp(firebaseConfig);

// ✅ This works in Expo without custom persistence
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
