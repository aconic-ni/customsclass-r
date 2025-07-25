// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH_rkE5fniotIfsFQVqJkoPpUIbytB_ck",
  authDomain: "customsclass-r-6a2cf.firebaseapp.com",
  projectId: "customsclass-r-6a2cf",
  storageBucket: "customsclass-r-6a2cf.firebasestorage.app",
  messagingSenderId: "430062147128",
  appId: "1:430062147128:web:5a91810cb1f2001432b8cd",
  measurementId: "G-5JC10J47GX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
