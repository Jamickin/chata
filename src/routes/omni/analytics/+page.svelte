<script>
	import { onMount } from 'svelte';
	import {
		choresCollection,
		groceryListsCollection,
		groceryItemsCollection,
		rewardsCollection,
		familyMembersCollection
	} from '$lib/firebase';
	import { getDocs, query, where } from 'firebase/firestore';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import Loading from '$lib/components/Loading.svelte';

	let loading = $state(true);
	let stats = $state({
		totalChores: 0,
		completedChores: 0,
		pendingChores: 0,
		totalGroceryLists: 0,
		totalGroceryItems: 0,
		purchasedItems: 0,
		totalRewards: 0,
		totalMembers: 0
	});

	let memberStats = $state([]);

	onMount(async () => {
		await loadAnalytics();
	});

	async function loadAnalytics() {
		loading = true;
		try {
			// Load all data
			const [choresSnap, listsSnap, itemsSnap, rewardsSnap, membersSnap] = await Promise.all([
				getDocs(choresCollection),
				getDocs(groceryListsCollection),
				getDocs(groceryItemsCollection),
				getDocs(rewardsCollection),
				getDocs(familyMembersCollection)
			]);

			const chores = choresSnap.docs.map((d) => d.data());
			const items = itemsSnap.docs.map((d) => d.data());
			const rewards = rewardsSnap.docs.map((d) => d.data());
			const members = membersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

			// Calculate overall stats
			stats.totalChores = chores.length;
			stats.completedChores = chores.filter((c) => c.status === 'completed').length;
			stats.pendingChores = chores.filter((c) => c.status !== 'completed').length;
			stats.totalGroceryLists = listsSnap.size;
			stats.totalGroceryItems = items.length;
			stats.purchasedItems = items.filter((i) => i.purchased).length;
			stats.totalRewards = rewards.length;
			stats.totalMembers = members.length;

			// Calculate per-member stats
			memberStats = members.map((member) => {
				const memberChores = chores.filter((c) => c.assigned_to === member.id);
				const memberRewards = rewards.filter((r) => r.member_id === member.id);
				const totalPoints = memberRewards.reduce((sum, r) => sum + (r.points || 0), 0);

				return {
					name: member.name,
					choresAssigned: memberChores.length,
					choresCompleted: memberChores.filter((c) => c.status === 'completed').length,
					totalPoints: totalPoints,
					rewardsCount: memberRewards.length
				};
			});
		} catch (error) {
			console.error('Error loading analytics:', error);
		} finally {
			loading = false;
		}
	}

	let completionRate = $derived(
		stats.totalChores > 0 ? Math.round((stats.completedChores / stats.totalChores) * 100) : 0
	);
	let groceryProgress = $derived(
		stats.totalGroceryItems > 0
			? Math.round((stats.purchasedItems / stats.totalGroceryItems) * 100)
			: 0
	);
</script>

<AnimatedBackground variant="particles" opacity={0.1} colorScheme="indigo" />

<div class="max-w-6xl mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl md:text-4xl font-bold text-white mb-2">Analytics</h1>
		<p class="text-slate-400">Family activity and insights</p>
	</div>

	{#if loading}
		<Loading />
	{:else}
		<!-- Overview Stats -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
			<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
				<div class="text-3xl font-bold text-emerald-400">{stats.totalChores}</div>
				<div class="text-sm text-slate-400 mt-1">Total Chores</div>
			</div>

			<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
				<div class="text-3xl font-bold text-green-400">{stats.completedChores}</div>
				<div class="text-sm text-slate-400 mt-1">Completed</div>
			</div>

			<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
				<div class="text-3xl font-bold text-blue-400">{stats.totalGroceryLists}</div>
				<div class="text-sm text-slate-400 mt-1">Grocery Lists</div>
			</div>

			<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
				<div class="text-3xl font-bold text-purple-400">{stats.totalRewards}</div>
				<div class="text-sm text-slate-400 mt-1">Rewards Given</div>
			</div>
		</div>

		<!-- Progress Bars -->
		<div class="grid md:grid-cols-2 gap-6 mb-8">
			<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-white mb-4">Chore Completion Rate</h3>
				<div class="mb-2">
					<div class="flex justify-between text-sm text-slate-400 mb-1">
						<span>{stats.completedChores} completed</span>
						<span>{completionRate}%</span>
					</div>
					<div class="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
						<div
							class="bg-emerald-500 h-full transition-all duration-500"
							style="width: {completionRate}%"
						></div>
					</div>
				</div>
			</div>

			<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-white mb-4">Grocery Shopping Progress</h3>
				<div class="mb-2">
					<div class="flex justify-between text-sm text-slate-400 mb-1">
						<span>{stats.purchasedItems} purchased</span>
						<span>{groceryProgress}%</span>
					</div>
					<div class="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
						<div
							class="bg-blue-500 h-full transition-all duration-500"
							style="width: {groceryProgress}%"
						></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Member Leaderboard -->
		<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
			<h2 class="text-2xl font-bold text-white mb-6">Family Leaderboard</h2>

			{#if memberStats.length === 0}
				<p class="text-slate-400">No family members yet</p>
			{:else}
				<div class="space-y-4">
					{#each memberStats.sort((a, b) => b.totalPoints - a.totalPoints) as member, index}
						<div class="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
							<div
								class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white"
							>
								#{index + 1}
							</div>

							<div class="flex-1">
								<div class="font-semibold text-white">{member.name}</div>
								<div class="text-sm text-slate-400">
									{member.choresCompleted}/{member.choresAssigned} chores · {member.rewardsCount} rewards
								</div>
							</div>

							<div class="text-right">
								<div class="text-2xl font-bold text-purple-400">{member.totalPoints}</div>
								<div class="text-xs text-slate-400">points</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
