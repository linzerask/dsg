import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCV2s5X4L1W3BkicFXBkVRJu1rHB3ztLx4",
    authDomain: "dsg-liga.firebaseapp.com",
    projectId: "dsg-liga",
    storageBucket: "dsg-liga.firebasestorage.app",
    messagingSenderId: "288632127524",
    appId: "1:288632127524:web:e8457222db6746b16f18b1",
    measurementId: "G-JLXYJPG360"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };

