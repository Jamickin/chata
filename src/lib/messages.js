// src/messages.js
import { writable } from 'svelte/store';
import { getDocs } from 'firebase/firestore';
import { messagesCollection } from './firebase';

export const messages = writable([]);

export const fetchMessages = async () => {
	try {
		const querySnapshot = await getDocs(messagesCollection);
		const messagesArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		messages.set(messagesArray);
	} catch (error) {
		console.error('Error fetching messages: ', error);
	}
};
