import { initializeApp, getApp, getApps } from "firebase/app"; // Import for app initialization
import { getAuth } from "firebase/auth"; // Import for authentication
import { getFirestore } from "firebase/firestore"; // Import for Firestore
import { getStorage } from "firebase/storage"; // Import for Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyD6NVrPz3jJqw2DV6AySw9BEJ8oKUnrKsA",
  authDomain: "iniyapayanam-7a79c.firebaseapp.com",
  projectId: "iniyapayanam-7a79c",
  storageBucket: "iniyapayanam-7a79c.appspot.com",
  messagingSenderId: "966473442865",
  appId: "1:966473442865:web:6a401b08897dd07b2e1710",
  measurementId: "G-YC10XTJX5H",
  // No need for `databaseURL` here if you're using Firestore
};

// Check if Firebase is already initialized to avoid duplicate initialization
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig); // Initialize the app if not already initialized
} else {
  app = getApp(); // Use the existing app instance if already initialized
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth (for authentication purposes)
const auth = getAuth(app);

// Initialize Firebase Storage
const storage = getStorage(app); // ✅ Added storage initialization

// Export Firestore, Auth, and Storage for use in your application
export { auth, db, storage };
