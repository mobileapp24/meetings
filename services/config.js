import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: "AIzaSyArwPJHSQaP8TKaXeVoVWnwj6EAACfXRpQ", // Public key to access 
    authDomain: "pruebameeting-da55c.firebaseapp.com", // Authorized domain for authentication
    projectId: "pruebameeting-da55c", // Unique project identifier
    storageBucket: "pruebameeting-da55c", // Firebase storage URL
    messagingSenderId: "486078393972", // Sender ID for push notification services
    appId: "1:486078393972:web:f5d4d8eacc5d2b45f06b21" // Unique identifier 
  };

const app = initializeApp(firebaseConfig); // Initializes the Firebase application with the settings specified 
export const auth = getAuth(app); // Authentication service to manage registration, login and other user processes
export const db = getFirestore(app); // Firestore service to interact with the database