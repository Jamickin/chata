<script>
	import { db } from '../firebase';
	import {
		collection,
		addDoc,
		Timestamp,
		getDocs,
		deleteDoc,
		doc,
		updateDoc
	} from 'firebase/firestore';
	import { onMount } from 'svelte';

	let passcode = $state('');
	let tasks = $state([]);
	let newTask = $state('');
	let loading = $state(false);
	let editingTask = $state(null);
	let editTaskText = $state('');
	let editTaskPasscode = $state('');

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

	async function toggleTodo(task) {
		try {
			await updateDoc(doc(db, 'todos', task.id), {
				done: !task.done
			});
			tasks = tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t));
		} catch (error) {
			console.error('Error updating todo:', error);
		}
	}

	function startEditing(task) {
		const userPasscode = prompt('Enter the passcode to edit this task:');
		if (userPasscode !== task.passcode) {
			alert('Incorrect passcode! Editing canceled.');
			return;
		}
		editingTask = task;
		editTaskText = task.text;
		editTaskPasscode = task.passcode;
	}

	async function saveEdit() {
		if (!editTaskText.trim()) {
			alert('Task text cannot be empty!');
			return;
		}

		try {
			await updateDoc(doc(db, 'todos', editingTask.id), {
				text: editTaskText
			});

			// Update local state
			tasks = tasks.map((t) => (t.id === editingTask.id ? { ...t, text: editTaskText } : t));

			// Reset editing state
			editingTask = null;
			editTaskText = '';
			editTaskPasscode = '';
		} catch (error) {
			console.error('Error editing todo:', error);
		}
	}

	function cancelEdit() {
		editingTask = null;
		editTaskText = '';
		editTaskPasscode = '';
	}
</script>

<section>
	<h1 class="text-2xl font-bold mb-4 text-center">Todo List</h1>

	<div class="flex gap-2 mb-4 flex-col">
		<input
			class="flex-1 p-2 focus:ring-2"
			placeholder="New task"
			oninput={(e) => (newTask = e.target.value)}
			onkeyup={(e) => e.key === 'Enter' && add()}
			bind:value={newTask}
		/>
		<input
			class="flex-1 p-2 focus:ring-2"
			placeholder="Passcode"
			oninput={(e) => (passcode = e.target.value)}
			onkeyup={(e) => e.key === 'Enter' && add()}
			bind:value={passcode}
		/>
		<button
			class="p-2 bg-orange-500 hover:bg-orange-600 rounded-md text-white font-bold"
			onclick={add}
		>
			Add Task
		</button>
	</div>

	<ul>
		{#if !loading}
			{#each tasks as task}
				<li class="flex items-center justify-between border border-slate-300 p-2 rounded-md mb-2">
					{#if editingTask && editingTask.id === task.id}
						<div class="flex items-center w-full gap-2">
							<input
								type="text"
								class="flex-1 p-2 border rounded"
								bind:value={editTaskText}
								placeholder="Edit task"
							/>
							<button class="bg-green-500 text-white p-2 rounded" onclick={saveEdit}> Save </button>
							<button class="bg-gray-red text-black p-2 rounded" onclick={cancelEdit}>
								Cancel
							</button>
						</div>
					{:else}
						<input
							type="checkbox"
							checked={task.done}
							onchange={() => toggleTodo(task)}
							class="mr-2"
						/>
						<span class="flex-1" class:line-through={task.done}>{task.text}</span>
						<button
							class="bg-orange-500 hover:bg-orange-600 mr-2"
							onclick={() => startEditing(task)}
						>
							Edit
						</button>
						<button
							class="bg-red-600 hover:bg-red-700"
							onclick={() => deleteTodo(task.id, task.passcode)}
						>
							x
						</button>
					{/if}
				</li>
			{/each}
		{:else}
			Loading
		{/if}
	</ul>
</section>
