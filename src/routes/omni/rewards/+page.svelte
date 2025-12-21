<script>
	import { onMount } from 'svelte';
	import { rewardsCollection, badgesCollection, familyMembersCollection } from '$lib/firebase';
	import { addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import Loading from '$lib/components/Loading.svelte';

	let rewards = $state([]);
	let badges = $state([]);
	let members = $state([]);
	let loading = $state(true);
	let showRewardForm = $state(false);

	// Form fields
	let rewardName = $state('');
	let rewardDescription = $state('');
	let rewardPoints = $state(10);
	let rewardMember = $state('');

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const [rewardsSnap, badgesSnap, membersSnap] = await Promise.all([
				getDocs(rewardsCollection),
				getDocs(badgesCollection),
				getDocs(familyMembersCollection)
			]);

			rewards = rewardsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			badges = badgesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			members = membersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function addReward() {
		if (!rewardName.trim() || !rewardMember) return;

		try {
			await addDoc(rewardsCollection, {
				name: rewardName.trim(),
				description: rewardDescription.trim(),
				points: rewardPoints,
				member_id: rewardMember,
				created_at: serverTimestamp()
			});
			resetForm();
			showRewardForm = false;
			await loadData();
		} catch (error) {
			console.error('Error adding reward:', error);
		}
	}

	async function deleteReward(id) {
		if (!confirm('Delete this reward?')) return;
		try {
			await deleteDoc(doc(rewardsCollection, id));
			await loadData();
		} catch (error) {
			console.error('Error deleting reward:', error);
		}
	}

	function resetForm() {
		rewardName = '';
		rewardDescription = '';
		rewardPoints = 10;
		rewardMember = '';
	}
</script>

<AnimatedBackground variant="particles" opacity={0.1} colorScheme="purple" />

<div class="max-w-6xl mx-auto px-4 py-8">
	<div class="flex justify-between items-center mb-8">
		<div>
			<h1 class="text-4xl font-bold text-white mb-2">Rewards & Badges</h1>
			<p class="text-slate-400">Track achievements and rewards</p>
		</div>
		<button
			onclick={() => (showRewardForm = true)}
			class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition"
		>
			+ Add Reward
		</button>
	</div>

	{#if loading}
		<Loading />
	{:else}
		<div class="grid md:grid-cols-2 gap-8">
			<!-- Rewards -->
			<div>
				<h2 class="text-2xl font-bold text-white mb-4">Recent Rewards</h2>
				{#if rewards.length === 0}
					<p class="text-slate-400">No rewards yet</p>
				{:else}
					<div class="space-y-4">
						{#each rewards as reward}
							<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
								<div class="flex justify-between items-start">
									<div>
										<h3 class="text-lg font-semibold text-white">{reward.name}</h3>
										{#if reward.description}
											<p class="text-sm text-slate-400 mt-1">{reward.description}</p>
										{/if}
										<div class="flex gap-2 mt-2">
											<span class="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
												{reward.points} points
											</span>
											<span class="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs">
												{members.find((m) => m.id === reward.member_id)?.name || 'Unknown'}
											</span>
										</div>
									</div>
									<button
										onclick={() => deleteReward(reward.id)}
										class="text-red-400 hover:text-red-300"
									>
										×
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Badges -->
			<div>
				<h2 class="text-2xl font-bold text-white mb-4">Badges</h2>
				{#if badges.length === 0}
					<p class="text-slate-400">No badges yet</p>
				{:else}
					<div class="grid grid-cols-2 gap-4">
						{#each badges as badge}
							<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
								<div class="text-4xl mb-2">{badge.icon || '🏆'}</div>
								<h3 class="font-semibold text-white">{badge.name}</h3>
								<p class="text-xs text-slate-400 mt-1">{badge.description}</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Add Reward Modal -->
{#if showRewardForm}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-slate-800 rounded-xl p-8 max-w-md w-full">
			<h2 class="text-2xl font-bold text-white mb-6">Add Reward</h2>

			<div class="space-y-4 mb-6">
				<div>
					<label for="reward-name" class="block text-sm text-slate-300 mb-2">Name</label>
					<input
					id="reward-name"
						type="text"
						bind:value={rewardName}
						class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="reward-description" class="block text-sm text-slate-300 mb-2">Description</label>
					<textarea
					id="reward-description"
						bind:value={rewardDescription}
						class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
						rows="2"
					></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="reward-points" class="block text-sm text-slate-300 mb-2">Points</label>
						<input
						id="reward-points"
							type="number"
							bind:value={rewardPoints}
							class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
						/>
					</div>

					<div>
						<label for="reward-member" class="block text-sm text-slate-300 mb-2">Member</label>
						<select
						id="reward-member"
							bind:value={rewardMember}
							class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
						>
							<option value="">Select</option>
							{#each members as member}
								<option value={member.id}>{member.name}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			<div class="flex gap-3">
				<button
					onclick={addReward}
					class="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition"
				>
					Add Reward
				</button>
				<button
					onclick={() => {
						showRewardForm = false;
						resetForm();
					}}
					class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
