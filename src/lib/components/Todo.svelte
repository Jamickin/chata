<script>
	import { db } from '../firebase';
	import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
	import { onMount } from 'svelte';

	let passcode = $state('');
	let tasks = $state([]);
	let newTask = $state('');
	let loading = $state(false);

	onMount(() => {
		fetchTodos();
	});

	const fetchTodos = async () => {
		try {
			loading = true;
			const querySnapshot = await getDocs(collection(db, 'todos'));
			tasks = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				text: doc.data().text,
				passcode: doc.data().passcode,
				done: doc.data().done || false
			}));
		} catch (error) {
			console.error('Error fetching todos:', error);
		} finally {
			loading = false;
		}
	};

	async function add() {
		if (!newTask.trim() || !passcode.trim()) return alert('Task and passcode required!');
		try {
			await addDoc(collection(db, 'todos'), {
				text: newTask,
				passcode,
				done: false,
				date: Timestamp.now()
			});
			newTask = '';
			passcode = '';
			await fetchTodos();
		} catch (error) {
			console.error('Error adding todo:', error);
		}
	}

	async function deleteTodo(todoId, todoPasscode) {
		const userPasscode = prompt('Enter the passcode to delete this task:');
		if (userPasscode !== todoPasscode) {
			alert('Incorrect passcode! Deletion canceled.');
			return;
		}
		try {
			await deleteDoc(doc(db, 'todos', todoId));
			tasks = tasks.filter((task) => task.id !== todoId);
			console.log('Todo deleted successfully');
		} catch (error) {
			console.error('Error deleting todo:', error);
		}
	}
</script>

<section>
	<h1 class="text-2xl font-bold mb-4 text-center">Todo List</h1>
	<div class="flex gap-2 mb-4">
		<input
			class="flex-1 p-2 rounded-md border border-gray-600 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
			placeholder="New task"
			oninput={(e) => (newTask = e.target.value)}
			onkeyup={(e) => e.key === 'Enter' && add()}
			bind:value={newTask}
		/>
		<input
			class="flex-1 p-2 rounded-md border border-gray-600 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
			placeholder="Passcode"
			oninput={(e) => (passcode = e.target.value)}
			onkeyup={(e) => e.key === 'Enter' && add()}
			bind:value={passcode}
		/>
		<button
			class="p-2 bg-orange-500 hover:bg-orange-600 rounded-md text-white font-bold"
			onclick={add}
		>
			+
		</button>
	</div>
	<ul>
		{#if !loading}
			{#each tasks as task}
				<li class="flex items-center justify-between bg-gray-700 p-2 rounded-md mb-2">
					<input
						type="checkbox"
						onchange={() => (task.done = !task.done)}
						bind:checked={task.done}
						class="mr-2"
					/>
					<span class="flex-1" class:line-through={task.done}>{task.text}</span>
					<button
						class="text-red-500 hover:text-red-700"
						onclick={() => deleteTodo(task.id, task.passcode)}>x</button
					>
				</li>
			{/each}
		{:else}
			Loading{/if}
	</ul>
</section>
