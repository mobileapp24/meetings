import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
//import {
  //FIREBASE_API_KEY,
  //FIREBASE_AUTH_DOMAIN,
  //FIREBASE_PROJECT_ID,
  //FIREBASE_STORAGE_BUCKET,
//  FIREBASE_MESSAGING_SENDER_ID,
//  FIREBASE_APP_ID,
//} from '@env';
//import Config from 'react-native-config';

//const apiKey1 = Config.FIREBASE_API_KEY;
//const authDomain1 = Config.FIREBASE_AUTH_DOMAIN;
//const projectId1 = Config.FIREBASE_PROJECT_ID;
//const storageBucket1 = Config.FIREBASE_STORAGE_BUCKET;
//const messagingSenderId1 = Config.FIREBASE_MESSAGING_SENDER_ID;
//const appId1 = Config.FIREBASE_APP_ID;


const firebaseConfig2 = {
    apiKey: process.env.FIREBASE_API_KEY, // Public key to access 
    authDomain: process.env.FIREBASE_AUTH_DOMAIN, // Authorized domain for authentication
    projectId: process.env.FIREBASE_PROJECT_ID, // Unique project identifier
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Firebase storage URL
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID, // Sender ID for push notification services
    appId: process.env.FIREBASE_APP_ID // Unique identifier 
  };

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