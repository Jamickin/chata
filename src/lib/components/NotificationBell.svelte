<script>
	import { onMount } from 'svelte';

	// Sample notifications - now using $props() instead of export
	let {
		notifications = [
			{
				id: 1,
				title: 'New message from Tatiana',
				message: 'Check out my latest post!',
				time: '10 minutes ago',
				read: false
			},
			{
				id: 2,
				title: 'New task added',
				message: 'Someone added a new task to the todo list.',
				time: '2 hours ago',
				read: false
			},
			{
				id: 3,
				title: 'Currency rates updated',
				message: 'Exchange rates have been refreshed.',
				time: 'Yesterday',
				read: true
			}
		]
	} = $props();

	let showNotifications = $state(false);
	let unreadCount = $state(0);
	let bellRef;

	// Count unread notifications
	$effect(() => {
		unreadCount = notifications.filter((n) => !n.read).length;
	});

	function toggleNotifications() {
		showNotifications = !showNotifications;
	}

	function markAsRead(id) {
		notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
	}

	function markAllAsRead() {
		notifications = notifications.map((n) => ({ ...n, read: true }));
	}

	function removeNotification(id) {
		notifications = notifications.filter((n) => n.id !== id);
	}

	// Close notifications when clicking outside
	onMount(() => {
		function handleClickOutside(event) {
			if (bellRef && !bellRef.contains(event.target) && showNotifications) {
				showNotifications = false;
			}
		}

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
</script>

<div class="relative z-50" bind:this={bellRef}>
	<button
		class="fixed top-4 right-4 md:right-8 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
		on:click={toggleNotifications}
		aria-label="Notifications"
	>
		<!-- Bell Icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="w-5 h-5 text-slate-700 dark:text-slate-300 {unreadCount > 0 ? 'animate-wiggle' : ''}"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
			<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
		</svg>

		<!-- Notification Counter -->
		{#if unreadCount > 0}
			<span
				class="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full"
			>
				{unreadCount}
			</span>
		{/if}
	</button>

	<!-- Notifications Panel -->
	{#if showNotifications}
		<div
			class="fixed top-16 right-4 md:right-8 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-slideDown"
		>
			<div
				class="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
			>
				<h3 class="font-semibold text-slate-800 dark:text-white">Notifications</h3>
				{#if unreadCount > 0}
					<button
						class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
						on:click={markAllAsRead}
					>
						Mark all as read
					</button>
				{/if}
			</div>

			{#if notifications.length === 0}
				<div class="p-4 text-center text-slate-500 dark:text-slate-400">
					No notifications to display
				</div>
			{:else}
				<div>
					{#each notifications as notification}
						<div
							class="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative {notification.read
								? 'opacity-75'
								: ''}"
						>
							<div class="flex justify-between items-start">
								<h4 class="font-medium text-slate-800 dark:text-white text-sm">
									{notification.title}
								</h4>
								<div class="flex gap-1">
									{#if !notification.read}
										<button
											class="text-blue-600 dark:text-blue-400 p-1"
											on:click={() => markAsRead(notification.id)}
											aria-label="Mark as read"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<polyline points="20 6 9 17 4 12"></polyline>
											</svg>
										</button>
									{/if}
									<button
										class="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1"
										on:click={() => removeNotification(notification.id)}
										aria-label="Remove notification"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<line x1="18" y1="6" x2="6" y2="18"></line>
											<line x1="6" y1="6" x2="18" y2="18"></line>
										</svg>
									</button>
								</div>
							</div>
							<p class="text-sm text-slate-600 dark:text-slate-300 mt-1">{notification.message}</p>
							<p class="text-xs text-slate-400 dark:text-slate-500 mt-2">{notification.time}</p>
							{#if !notification.read}
								<div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<div class="p-2 text-center border-t border-slate-200 dark:border-slate-700">
				<a href="/toni" class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
					>View all notifications</a
				>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(0);
		}
		25% {
			transform: rotate(-10deg);
		}
		50% {
			transform: rotate(0);
		}
		75% {
			transform: rotate(10deg);
		}
	}

	.animate-wiggle {
		animation: wiggle 1s ease-in-out infinite;
	}

	@keyframes slideDown {
		0% {
			opacity: 0;
			transform: translateY(-10px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slideDown {
		animation: slideDown 0.2s ease-out forwards;
	}
</style>
