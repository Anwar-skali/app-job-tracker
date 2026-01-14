import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyD_kVAMSRVpy7XEQhbh4rG_Y8TrtKSgv18",
    authDomain: "app-job-tracker.firebaseapp.com",
    projectId: "app-job-tracker",
    storageBucket: "app-job-tracker.firebasestorage.app",
    messagingSenderId: "1059424141738",
    appId: "1:1059424141738:web:27ef1def2fc8b60901ebd3",
    measurementId: "G-6CF50H16MC"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence for React Native
let auth;
try {
    auth = getAuth(app);
} catch (e) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

