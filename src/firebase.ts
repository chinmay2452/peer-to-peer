// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4hMhXWkPofwFqJfaYovEHU3ucDP3uI7c",
  authDomain: "peer-to-peer-44de3.firebaseapp.com",
  projectId: "peer-to-peer-44de3",
  storageBucket: "peer-to-peer-44de3.firebasestorage.app",
  messagingSenderId: "411555659636",
  appId: "1:411555659636:web:c599414ae0430a2572f621",
  measurementId: "G-QTZ8GFD8JS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase initialized:", app.name);
export const auth = getAuth(app);