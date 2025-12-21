<script>
	import { onMount } from 'svelte';
	import { choresCollection, familyMembersCollection } from '$lib/firebase';
	import {
		addDoc,
		getDocs,
		updateDoc,
		deleteDoc,
		doc,
		query,
		orderBy,
		serverTimestamp
	} from 'firebase/firestore';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import Loading from '$lib/components/Loading.svelte';

	let chores = $state([]);
	let familyMembers = $state([]);
	let loading = $state(true);
	let showForm = $state(false);
	let editingChore = $state(null);

	// Form fields
	let title = $state('');
	let description = $state('');
	let assignedTo = $state('');
	let dueDate = $state('');
	let priority = $state('medium');
	let status = $state('pending');

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			// Load chores
			const choresQuery = query(choresCollection, orderBy('created_at', 'desc'));
			const choresSnapshot = await getDocs(choresQuery);
			chores = choresSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));

			// Load family members
			const membersSnapshot = await getDocs(familyMembersCollection);
			familyMembers = membersSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));

			// If no family members exist, create some defaults
			if (familyMembers.length === 0) {
				await createDefaultMembers();
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function createDefaultMembers() {
		const defaultMembers = ['Mom', 'Dad', 'Kid 1', 'Kid 2'];
		for (const name of defaultMembers) {
			await addDoc(familyMembersCollection, { name, created_at: serverTimestamp() });
		}
		const membersSnapshot = await getDocs(familyMembersCollection);
		familyMembers = membersSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));
	}

	function openForm(chore = null) {
		if (chore) {
			editingChore = chore;
			title = chore.title;
			description = chore.description || '';
			assignedTo = chore.assigned_to || '';
			dueDate = chore.due_date || '';
			priority = chore.priority || 'medium';
			status = chore.status || 'pending';
		} else {
			editingChore = null;
			resetForm();
		}
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		resetForm();
	}

	function resetForm() {
		title = '';
		description = '';
		assignedTo = '';
		dueDate = '';
		priority = 'medium';
		status = 'pending';
		editingChore = null;
	}

	async function saveChore() {
		if (!title.trim()) {
			alert('Please enter a title');
			return;
		}

		const choreData = {
			title: title.trim(),
			description: description.trim(),
			assigned_to: assignedTo,
			due_date: dueDate,
			priority,
			status,
			updated_at: serverTimestamp()
		};

		try {
			if (editingChore) {
				const choreRef = doc(choresCollection, editingChore.id);
				await updateDoc(choreRef, choreData);
			} else {
				choreData.created_at = serverTimestamp();
				await addDoc(choresCollection, choreData);
			}
			closeForm();
			await loadData();
		} catch (error) {
			console.error('Error saving chore:', error);
			alert('Failed to save chore');
		}
	}

	async function deleteChore(choreId) {
		if (!confirm('Are you sure you want to delete this chore?')) return;

		try {
			await deleteDoc(doc(choresCollection, choreId));
			await loadData();
		} catch (error) {
			console.error('Error deleting chore:', error);
			alert('Failed to delete chore');
		}
	}

	async function toggleStatus(chore) {
		const newStatus = chore.status === 'completed' ? 'pending' : 'completed';
		try {
			await updateDoc(doc(choresCollection, chore.id), {
				status: newStatus,
				updated_at: serverTimestamp(),
				completed_at: newStatus === 'completed' ? serverTimestamp() : null
			});
			await loadData();
		} catch (error) {
			console.error('Error updating status:', error);
		}
	}

	function getPriorityColor(priority) {
		const colors = {
			low: 'bg-blue-500/20 text-blue-300',
			medium: 'bg-yellow-500/20 text-yellow-300',
			high: 'bg-red-500/20 text-red-300'
		};
		return colors[priority] || colors.medium;
	}

	function getStatusColor(status) {
		return status === 'completed'
			? 'bg-green-500/20 text-green-300'
			: 'bg-slate-500/20 text-slate-300';
	}
</script>

<AnimatedBackground variant="particles" opacity={0.1} colorScheme="green" />

<div class="max-w-6xl mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-8">
		<div>
			<h1 class="text-4xl font-bold text-white mb-2">Chores</h1>
			<p class="text-slate-400">Manage household tasks and assignments</p>
		</div>
		<button
			onclick={() => openForm()}
			class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
		>
			+ Add Chore
		</button>
	</div>

	{#if loading}
		<Loading />
	{:else if chores.length === 0}
		<div class="text-center py-16">
			<p class="text-slate-400 mb-4">No chores yet. Click "Add Chore" to get started!</p>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each chores as chore (chore.id)}
				<div
					class="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition-all"
				>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<button
									onclick={() => toggleStatus(chore)}
									class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all {chore.status ===
									'completed'
										? 'bg-emerald-500 border-emerald-500'
										: 'border-slate-500 hover:border-emerald-500'}"
								>
									{#if chore.status === 'completed'}
										<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
									{/if}
								</button>
								<h3
									class="text-xl font-semibold text-white {chore.status === 'completed'
										? 'line-through opacity-50'
										: ''}"
								>
									{chore.title}
								</h3>
							</div>

							{#if chore.description}
								<p class="text-slate-300 mb-3 ml-9">{chore.description}</p>
							{/if}

							<div class="flex flex-wrap gap-2 ml-9">
								<span class="px-3 py-1 rounded-full text-xs {getPriorityColor(chore.priority)}">
									{chore.priority} priority
								</span>
								<span class="px-3 py-1 rounded-full text-xs {getStatusColor(chore.status)}">
									{chore.status}
								</span>
								{#if chore.assigned_to}
									<span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
										👤 {familyMembers.find((m) => m.id === chore.assigned_to)?.name || 'Unknown'}
									</span>
								{/if}
								{#if chore.due_date}
									<span class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
										📅 {new Date(chore.due_date).toLocaleDateString()}
									</span>
								{/if}
							</div>
						</div>

						<div class="flex gap-2">
							<button
								onclick={() => openForm(chore)}
								class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition"
							>
								Edit
							</button>
							<button
								onclick={() => deleteChore(chore.id)}
								class="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Add/Edit Modal -->
{#if showForm}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-slate-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<h2 class="text-2xl font-bold text-white mb-6">
				{editingChore ? 'Edit Chore' : 'Add New Chore'}
			</h2>

			<div class="space-y-4">
				<div>
					<label for="chore-title" class="block text-sm font-medium text-slate-300 mb-2">Title *</label>
					<input
					id="chore-title"
						type="text"
						bind:value={title}
						class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						placeholder="Enter chore title"
					/>
				</div>

				<div>
					<label for="chore-description" class="block text-sm font-medium text-slate-300 mb-2">Description</label>
					<textarea
					id="chore-description"
						bind:value={description}
						class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						placeholder="Enter chore description"
						rows="3"
					></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="chore-assign" class="block text-sm font-medium text-slate-300 mb-2">Assign To</label>
						<select
						id="chore-assign"
							bind:value={assignedTo}
							class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						>
							<option value="">Unassigned</option>
							{#each familyMembers as member}
								<option value={member.id}>{member.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="chore-due-date" class="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
						<input
						id="chore-due-date"
							type="date"
							bind:value={dueDate}
							class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="chore-priority" class="block text-sm font-medium text-slate-300 mb-2">Priority</label>
						<select
						id="chore-priority"
							bind:value={priority}
							class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>

					<div>
						<label for="chore-status" class="block text-sm font-medium text-slate-300 mb-2">Status</label>
						<select
						id="chore-status"
							bind:value={status}
							class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						>
							<option value="pending">Pending</option>
							<option value="in_progress">In Progress</option>
							<option value="completed">Completed</option>
						</select>
					</div>
				</div>
			</div>

			<div class="flex gap-3 mt-8">
				<button
					onclick={saveChore}
					class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
				>
					{editingChore ? 'Update' : 'Create'} Chore
				</button>
				<button
					onclick={closeForm}
					class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
