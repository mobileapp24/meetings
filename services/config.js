import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';


const firebaseConfig = {
    apiKey: "AIzaSyArwPJHSQaP8TKaXeVoVWnwj6EAACfXRpQ",
    authDomain: "pruebameeting-da55c.firebaseapp.com",
    projectId: "pruebameeting-da55c",
    storageBucket: "pruebameeting-da55c.firebasestorage.app",
    messagingSenderId: "486078393972",
    appId: "1:486078393972:web:f5d4d8eacc5d2b45f06b21"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
