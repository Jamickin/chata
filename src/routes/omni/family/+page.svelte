<script>
	import { onMount } from 'svelte';
	import { familyMembersCollection } from '$lib/firebase';
	import { addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import Loading from '$lib/components/Loading.svelte';

	let members = $state([]);
	let loading = $state(true);
	let showForm = $state(false);
	let editingMember = $state(null);

	// Form fields
	let memberName = $state('');

	onMount(async () => {
		await loadMembers();
	});

	async function loadMembers() {
		loading = true;
		try {
			const snapshot = await getDocs(familyMembersCollection);
			members = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));
		} catch (error) {
			console.error('Error loading family members:', error);
		} finally {
			loading = false;
		}
	}

	function openForm(member = null) {
		if (member) {
			editingMember = member;
			memberName = member.name;
		} else {
			editingMember = null;
			memberName = '';
		}
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		memberName = '';
		editingMember = null;
	}

	async function saveMember() {
		if (!memberName.trim()) {
			alert('Please enter a name');
			return;
		}

		try {
			if (editingMember) {
				// Update existing member
				const memberRef = doc(familyMembersCollection, editingMember.id);
				await updateDoc(memberRef, {
					name: memberName.trim(),
					updated_at: serverTimestamp()
				});
			} else {
				// Create new member
				await addDoc(familyMembersCollection, {
					name: memberName.trim(),
					created_at: serverTimestamp()
				});
			}
			closeForm();
			await loadMembers();
		} catch (error) {
			console.error('Error saving member:', error);
			alert('Failed to save family member');
		}
	}

	async function deleteMember(memberId, memberName) {
		if (!confirm(`Are you sure you want to remove ${memberName}? This will not delete their associated chores or data.`)) {
			return;
		}

		try {
			await deleteDoc(doc(familyMembersCollection, memberId));
			await loadMembers();
		} catch (error) {
			console.error('Error deleting member:', error);
			alert('Failed to delete family member');
		}
	}
</script>

<AnimatedBackground variant="particles" opacity={0.1} colorScheme="green" />

<div class="max-w-4xl mx-auto px-4 py-8">
	<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
		<div>
			<h1 class="text-3xl md:text-4xl font-bold text-white mb-2">Family Members</h1>
			<p class="text-slate-400">Manage your household members</p>
		</div>
		<button
			onclick={() => openForm()}
			class="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
		>
			+ Add Member
		</button>
	</div>

	{#if loading}
		<Loading />
	{:else if members.length === 0}
		<div class="text-center py-16">
			<div class="text-6xl mb-4">👥</div>
			<p class="text-slate-400 mb-4">No family members yet. Add your first member to get started!</p>
			<button
				onclick={() => openForm()}
				class="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
			>
				Add Family Member
			</button>
		</div>
	{:else}
		<div class="grid md:grid-cols-2 gap-4">
			{#each members as member (member.id)}
				<div
					class="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition-all"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl"
							>
								{member.name.charAt(0).toUpperCase()}
							</div>
							<div>
								<h3 class="text-xl font-semibold text-white">{member.name}</h3>
								{#if member.created_at}
									<p class="text-sm text-slate-400">
										Added {new Date(member.created_at.seconds * 1000).toLocaleDateString()}
									</p>
								{/if}
							</div>
						</div>

						<div class="flex gap-2">
							<button
								onclick={() => openForm(member)}
								class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition"
								aria-label="Edit {member.name}"
							>
								Edit
							</button>
							<button
								onclick={() => deleteMember(member.id, member.name)}
								class="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition"
								aria-label="Delete {member.name}"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Info Card -->
	<div class="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
		<div class="flex gap-3">
			<div class="text-blue-400 text-xl">ℹ️</div>
			<div class="flex-1">
				<h4 class="font-semibold text-blue-300 mb-1">About Family Members</h4>
				<p class="text-sm text-blue-200/80">
					Family members can be assigned to chores and earn rewards. Deleting a member won't delete their chores or rewards - those will remain assigned to their ID.
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Add/Edit Modal -->
{#if showForm}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-slate-800 rounded-xl p-8 max-w-md w-full">
			<h2 class="text-2xl font-bold text-white mb-6">
				{editingMember ? 'Edit' : 'Add'} Family Member
			</h2>

			<div class="mb-6">
				<label for="member-name" class="block text-sm font-medium text-slate-300 mb-2">Name *</label>
				<input
					id="member-name"
					type="text"
					bind:value={memberName}
					class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
					placeholder="Enter member name"
					autofocus
				/>
			</div>

			<div class="flex gap-3">
				<button
					onclick={saveMember}
					class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
				>
					{editingMember ? 'Update' : 'Add'} Member
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
