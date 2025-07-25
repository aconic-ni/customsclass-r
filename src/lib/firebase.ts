
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7gRd01h-LCnyoDN25yU4IOuoFKNVis5E",
  authDomain: "customsclass-r-6a2cf.firebaseapp.com",
  projectId: "customsclass-r-6a2cf",
  storageBucket: "customsclass-r-6a2cf.firebasestorage.app",
  messagingSenderId: "430062147128",
  appId: "1:430062147128:web:005c9a19a919f85932b8cd",
  measurementId: "G-SBN0L7M87X"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics and export it
// We are checking if analytics is supported by the browser
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
