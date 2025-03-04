// src/messages.js
import { writable } from 'svelte/store';
import { getDocs } from 'firebase/firestore';
import { todosCollection } from './firebase';

export const todos = writable([]);

export const fetchTodos = async () => {
	try {
		const querySnapshot = await getDocs(todosCollection);
		const todosArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		todos.set(todosArray);
	} catch (error) {
		console.error('Error fetching todos: ', error);
	}
};
