// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Correct import for getAuth

const firebaseConfig = {
	apiKey: 'AIzaSyBN3xiXITzSBUCgZ85TEM9kU_E5-sqMn88',
	authDomain: 'chata-d12ca.firebaseapp.com',
	projectId: 'chata-d12ca',
	storageBucket: 'chata-d12ca.firebasestorage.app',
	messagingSenderId: '765245336492',
	appId: '1:765245336492:web:db8887e132a8e705b42809'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export const messagesCollection = collection(db, 'messages');
export const todosCollection = collection(db, 'todos');

const STATIC_APP_ID = 'chata-d12ca';

export const tidbitsCollection = collection(db, `artifacts/${STATIC_APP_ID}/public/data/tidbits`);
