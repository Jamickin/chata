<script>
	import { onMount } from 'svelte';

	// Create a store to track dark mode state
	let darkMode = $state(false);
	let mounted = $state(false);

	// Function to apply dark mode class
	function applyTheme(isDark) {
		if (typeof document !== 'undefined') {
			if (isDark) {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			} else {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			}
		}
	}

	// Initialize dark mode based on local storage or system preference
	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark =
			window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

		// Set the initial state
		if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
			darkMode = true;
		} else {
			darkMode = false;
		}

		// Apply the theme based on initial state
		applyTheme(darkMode);

		// Mark as mounted to prevent changes during SSR
		mounted = true;

		// Set up listener for system preference changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e) => {
			if (!localStorage.getItem('theme')) {
				darkMode = e.matches;
				applyTheme(e.matches);
			}
		};

		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener('change', handleChange);
		} else {
			// Fallback for older browsers
			mediaQuery.addListener(handleChange);
		}

		return () => {
			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener('change', handleChange);
			} else {
				// Fallback for older browsers
				mediaQuery.removeListener(handleChange);
			}
		};
	});

	// Watch for changes in dark mode state
	$effect(() => {
		if (mounted) {
			applyTheme(darkMode);
		}
	});

	// Toggle dark mode
	function toggleDarkMode() {
		darkMode = !darkMode;
	}
</script>

<button
	aria-label="Toggle dark mode"
	class="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
	on:click={toggleDarkMode}
>
	{#if darkMode}
		<!-- Sun icon for light mode -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-yellow-500"
		>
			<circle cx="12" cy="12" r="5"></circle>
			<line x1="12" y1="1" x2="12" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="23"></line>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
			<line x1="1" y1="12" x2="3" y2="12"></line>
			<line x1="21" y1="12" x2="23" y2="12"></line>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
		</svg>
	{:else}
		<!-- Moon icon for dark mode -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-slate-700"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>
	{/if}
</button>
