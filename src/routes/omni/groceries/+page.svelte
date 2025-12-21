<script>
	import { onMount } from 'svelte';
	import { groceryListsCollection, groceryItemsCollection } from '$lib/firebase';
	import {
		addDoc,
		getDocs,
		updateDoc,
		deleteDoc,
		doc,
		query,
		where,
		orderBy,
		serverTimestamp
	} from 'firebase/firestore';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import Loading from '$lib/components/Loading.svelte';

	let lists = $state([]);
	let selectedList = $state(null);
	let items = $state([]);
	let loading = $state(true);
	let showListForm = $state(false);
	let showItemForm = $state(false);

	// List form
	let listName = $state('');

	// Item form
	let itemName = $state('');
	let itemQuantity = $state(1);
	let itemCategory = $state('');
	let itemPurchased = $state(false);

	onMount(async () => {
		await loadLists();
	});

	async function loadLists() {
		loading = true;
		try {
			const listsSnapshot = await getDocs(groceryListsCollection);
			lists = listsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));

			if (lists.length > 0 && !selectedList) {
				await selectList(lists[0]);
			}
		} catch (error) {
			console.error('Error loading lists:', error);
		} finally {
			loading = false;
		}
	}

	async function selectList(list) {
		selectedList = list;
		await loadItems(list.id);
	}

	async function loadItems(listId) {
		try {
			const itemsQuery = query(
				groceryItemsCollection,
				where('list_id', '==', listId),
				orderBy('created_at', 'desc')
			);
			const itemsSnapshot = await getDocs(itemsQuery);
			items = itemsSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));
		} catch (error) {
			console.error('Error loading items:', error);
		}
	}

	async function createList() {
		if (!listName.trim()) {
			alert('Please enter a list name');
			return;
		}

		try {
			const listData = {
				name: listName.trim(),
				created_at: serverTimestamp()
			};
			await addDoc(groceryListsCollection, listData);
			listName = '';
			showListForm = false;
			await loadLists();
		} catch (error) {
			console.error('Error creating list:', error);
			alert('Failed to create list');
		}
	}

	async function deleteList(listId) {
		if (!confirm('Are you sure? This will delete the list and all its items.')) return;

		try {
			// Delete all items in the list
			const itemsQuery = query(groceryItemsCollection, where('list_id', '==', listId));
			const itemsSnapshot = await getDocs(itemsQuery);
			for (const itemDoc of itemsSnapshot.docs) {
				await deleteDoc(itemDoc.ref);
			}

			// Delete the list
			await deleteDoc(doc(groceryListsCollection, listId));

			if (selectedList?.id === listId) {
				selectedList = null;
				items = [];
			}
			await loadLists();
		} catch (error) {
			console.error('Error deleting list:', error);
			alert('Failed to delete list');
		}
	}

	async function addItem() {
		if (!itemName.trim() || !selectedList) {
			alert('Please enter an item name');
			return;
		}

		try {
			const itemData = {
				list_id: selectedList.id,
				name: itemName.trim(),
				quantity: itemQuantity,
				category: itemCategory.trim(),
				purchased: itemPurchased,
				created_at: serverTimestamp()
			};
			await addDoc(groceryItemsCollection, itemData);
			resetItemForm();
			showItemForm = false;
			await loadItems(selectedList.id);
		} catch (error) {
			console.error('Error adding item:', error);
			alert('Failed to add item');
		}
	}

	async function togglePurchased(item) {
		try {
			await updateDoc(doc(groceryItemsCollection, item.id), {
				purchased: !item.purchased,
				updated_at: serverTimestamp()
			});
			await loadItems(selectedList.id);
		} catch (error) {
			console.error('Error updating item:', error);
		}
	}

	async function deleteItem(itemId) {
		if (!confirm('Are you sure you want to delete this item?')) return;

		try {
			await deleteDoc(doc(groceryItemsCollection, itemId));
			await loadItems(selectedList.id);
		} catch (error) {
			console.error('Error deleting item:', error);
			alert('Failed to delete item');
		}
	}

	function resetItemForm() {
		itemName = '';
		itemQuantity = 1;
		itemCategory = '';
		itemPurchased = false;
	}

	function getCategoryColor(category) {
		const colors = {
			produce: 'bg-green-500/20 text-green-300',
			dairy: 'bg-blue-500/20 text-blue-300',
			meat: 'bg-red-500/20 text-red-300',
			pantry: 'bg-yellow-500/20 text-yellow-300',
			frozen: 'bg-cyan-500/20 text-cyan-300',
			bakery: 'bg-orange-500/20 text-orange-300',
			other: 'bg-slate-500/20 text-slate-300'
		};
		return colors[category?.toLowerCase()] || colors.other;
	}

	let purchasedCount = $derived(items.filter((i) => i.purchased).length);
	let totalCount = $derived(items.length);
</script>

<AnimatedBackground variant="particles" opacity={0.1} colorScheme="blue" />

<div class="max-w-6xl mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-4xl font-bold text-white mb-2">Grocery Lists</h1>
		<p class="text-slate-400">Manage your shopping lists</p>
	</div>

	{#if loading}
		<Loading />
	{:else}
		<div class="grid md:grid-cols-4 gap-6">
			<!-- Lists Sidebar -->
			<div class="md:col-span-1">
				<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-lg font-semibold text-white">Lists</h2>
						<button
							onclick={() => (showListForm = true)}
							class="text-emerald-400 hover:text-emerald-300"
						>
							+ New
						</button>
					</div>

					{#if lists.length === 0}
						<p class="text-sm text-slate-400">No lists yet</p>
					{:else}
						<div class="space-y-2">
							{#each lists as list}
								<div class="flex items-center gap-2">
									<button
										onclick={() => selectList(list)}
										class="flex-1 text-left px-3 py-2 rounded transition {selectedList?.id ===
										list.id
											? 'bg-emerald-500/20 text-emerald-300'
											: 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
									>
										{list.name}
									</button>
									<button
										onclick={() => deleteList(list.id)}
										class="px-2 py-1 text-red-400 hover:text-red-300"
									>
										×
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Items Area -->
			<div class="md:col-span-3">
				{#if selectedList}
					<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
						<div class="flex justify-between items-center mb-6">
							<div>
								<h2 class="text-2xl font-bold text-white">{selectedList.name}</h2>
								<p class="text-sm text-slate-400 mt-1">
									{purchasedCount} of {totalCount} items purchased
								</p>
							</div>
							<button
								onclick={() => (showItemForm = true)}
								class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
							>
								+ Add Item
							</button>
						</div>

						{#if items.length === 0}
							<div class="text-center py-12">
								<p class="text-slate-400">No items in this list yet</p>
							</div>
						{:else}
							<div class="space-y-3">
								{#each items as item (item.id)}
									<div
										class="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
									>
										<button
											onclick={() => togglePurchased(item)}
											class="w-6 h-6 rounded border-2 flex items-center justify-center transition {item.purchased
												? 'bg-emerald-500 border-emerald-500'
												: 'border-slate-500 hover:border-emerald-500'}"
										>
											{#if item.purchased}
												<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
												</svg>
											{/if}
										</button>

										<div class="flex-1">
											<div class="flex items-center gap-3">
												<span
													class="text-white {item.purchased ? 'line-through opacity-50' : ''}"
												>
													{item.name}
												</span>
												{#if item.quantity > 1}
													<span class="text-sm text-slate-400">× {item.quantity}</span>
												{/if}
												{#if item.category}
													<span class="px-2 py-1 rounded-full text-xs {getCategoryColor(item.category)}">
														{item.category}
													</span>
												{/if}
											</div>
										</div>

										<button
											onclick={() => deleteItem(item.id)}
											class="px-3 py-1 text-red-400 hover:text-red-300 transition"
										>
											Delete
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<div class="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
						<p class="text-slate-400">
							{lists.length === 0 ? 'Create a list to get started' : 'Select a list to view items'}
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- New List Modal -->
{#if showListForm}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-slate-800 rounded-xl p-8 max-w-md w-full">
			<h2 class="text-2xl font-bold text-white mb-6">Create New List</h2>

			<div class="mb-6">
				<label for="list-name" class="block text-sm font-medium text-slate-300 mb-2">List Name</label>
				<input
				id="list-name"
					type="text"
					bind:value={listName}
					class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
					placeholder="e.g., Weekly Shopping"
				/>
			</div>

			<div class="flex gap-3">
				<button
					onclick={createList}
					class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition"
				>
					Create List
				</button>
				<button
					onclick={() => {
						showListForm = false;
						listName = '';
					}}
					class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add Item Modal -->
{#if showItemForm}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="bg-slate-800 rounded-xl p-8 max-w-md w-full">
			<h2 class="text-2xl font-bold text-white mb-6">Add Item</h2>

			<div class="space-y-4 mb-6">
				<div>
					<label for="item-name" class="block text-sm font-medium text-slate-300 mb-2">Item Name</label>
					<input
					id="item-name"
						type="text"
						bind:value={itemName}
						class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						placeholder="e.g., Milk"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="item-quantity" class="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
						<input
						id="item-quantity"
							type="number"
							bind:value={itemQuantity}
							min="1"
							class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						/>
					</div>

					<div>
						<label for="item-category" class="block text-sm font-medium text-slate-300 mb-2">Category</label>
						<select
						id="item-category"
							bind:value={itemCategory}
							class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
						>
							<option value="">None</option>
							<option value="produce">Produce</option>
							<option value="dairy">Dairy</option>
							<option value="meat">Meat</option>
							<option value="pantry">Pantry</option>
							<option value="frozen">Frozen</option>
							<option value="bakery">Bakery</option>
							<option value="other">Other</option>
						</select>
					</div>
				</div>
			</div>

			<div class="flex gap-3">
				<button
					onclick={addItem}
					class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition"
				>
					Add Item
				</button>
				<button
					onclick={() => {
						showItemForm = false;
						resetItemForm();
					}}
					class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
