import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace these with your actual Firebase project configuration
// You can find this in your Firebase Console: Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyBkFmvuKeD6nEB4nNCtMh8e6u3TSC72ilE",
    authDomain: "advocate-890ae.firebaseapp.com",
    projectId: "advocate-890ae",
    storageBucket: "advocate-890ae.firebasestorage.app",
    messagingSenderId: "1051530818315",
    appId: "1:1051530818315:web:693161a8fb2fa9cc67280e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
