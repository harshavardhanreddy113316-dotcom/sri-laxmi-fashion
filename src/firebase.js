import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5jZInc8eaIdarwE9gTPBZ6_zZwX4vqbM",
  authDomain: "srilaxmifashion-90d2c.firebaseapp.com",
  projectId: "srilaxmifashion-90d2c",
  storageBucket: "srilaxmifashion-90d2c.firebasestorage.app",
  messagingSenderId: "399211739162",
  appId: "1:399211739162:web:d7f8282e3285583a2cb9a3",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);