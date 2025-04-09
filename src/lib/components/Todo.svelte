<script>
	import { db } from '../firebase';
	import Loading from './Loading.svelte';
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

<div class="todo-container">
	<h3>New Task</h3>
	<div class="form-control">
		<input
			placeholder="New task"
			on:input={(e) => (newTask = e.target.value)}
			on:keyup={(e) => e.key === 'Enter' && add()}
			bind:value={newTask}
			aria-label="New task"
		/>
		<input
			placeholder="Passcode"
			on:input={(e) => (passcode = e.target.value)}
			on:keyup={(e) => e.key === 'Enter' && add()}
			bind:value={passcode}
			aria-label="Passcode"
			type="password"
		/>
		<button class="good-button" on:click={add}>Add Task</button>
	</div>

	<h3>Tasks</h3>
	<div class="mt-4">
		{#if loading}
			<Loading />
		{:else if tasks.length === 0}
			<p class="text-center py-4">No tasks yet. Add your first one above!</p>
		{:else}
			<ul class="space-y-2">
				{#each tasks as task}
					<li
						class="border border-slate-300 dark:border-slate-600 p-3 rounded bg-white dark:bg-slate-800"
					>
						{#if editingTask && editingTask.id === task.id}
							<div class="form-control">
								<input type="text" bind:value={editTaskText} placeholder="Edit task" />
								<div class="button-group">
									<button class="good-button" on:click={saveEdit}>Save</button>
									<button class="care-button" on:click={cancelEdit}>Cancel</button>
								</div>
							</div>
						{:else}
							<div class="flex items-center gap-2 mb-2">
								<input
									type="checkbox"
									class="w-5 h-5"
									checked={task.done}
									on:change={() => toggleTodo(task)}
									aria-label="Mark as complete"
								/>
								<span class={task.done ? 'line-through' : ''}>{task.text}</span>
							</div>
							<div class="button-group">
								<button class="good-button" on:click={() => startEditing(task)}>Edit</button>
								<button class="care-button" on:click={() => deleteTodo(task.id, task.passcode)}>
									Delete
									{#if task.passcode !== ''}
										<span class="font-mono ml-1">#</span>
									{/if}
								</button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
