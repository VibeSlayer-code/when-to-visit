import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase project configuration object
// Contains all necessary keys to connect this app to the correct Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyBPHhXyNqf27hVWdhpEswwXSGi1sDTiOMY",
  authDomain: "when-to-visit.firebaseapp.com",
  databaseURL: "https://when-to-visit-default-rtdb.firebaseio.com",
  projectId: "when-to-visit",
  storageBucket: "when-to-visit.firebasestorage.app",
  messagingSenderId: "421754379892",
  appId: "1:421754379892:web:cadd7ff0d7a5b9d0bb3b21",
  measurementId: "G-246R1FLC5P"
};<invoke name="view_file_outline">
<parameter name="AbsolutePath">c:\Users\Vihaan\Desktop\When To Visit\src\services\firestoreService.js</parameter>
<parameter name="ItemOffset">0</parameter>
</invoke>

// Initialize the Firebase app using the configuration above
const app = initializeApp(firebaseConfig);
// Set up Firebase Authentication and Firestore Database instances
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth and db for use throughout the application
export { auth, db };
