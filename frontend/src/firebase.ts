import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD7M1WcckGYehFZrQFm2-AckLlaBSxlzNc",
    authDomain: "advocate-890ae-f21a8.firebaseapp.com",
    projectId: "advocate-890ae-f21a8",
    storageBucket: "advocate-890ae-f21a8.firebasestorage.app",
    messagingSenderId: "786888352844",
    appId: "1:786888352844:web:047ffec040ddc417cc80e9",
    measurementId: "G-95GJQZSYPM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);