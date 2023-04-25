// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB65xPTCbtXq3PgbGYatd6-WlJX0_djgVM",
  authDomain: "seer-5f275.firebaseapp.com",
  projectId: "seer-5f275",
  storageBucket: "seer-5f275.appspot.com",
  messagingSenderId: "669850973215",
  appId: "1:669850973215:web:fab680266695eb7878912a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);