import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyDRapogErid0EtCJ-CYbAJTOx_wXkYOpWc",
    authDomain: "app-job-tracker-bb496.firebaseapp.com",
    projectId: "app-job-tracker-bb496",
    storageBucket: "app-job-tracker-bb496.firebasestorage.app",
    messagingSenderId: "927179097034",
    appId: "1:927179097034:web:c733cfaf48ac1ece554533",
    measurementId: "G-YTXJHTZS26"
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

