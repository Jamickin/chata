<script>
	// Using $props() instead of export statements
	let {
		title = 'Feature Title',
		description = 'Feature description goes here.',
		icon = 'default', // Can be 'settings', 'message', 'calendar', etc.
		color = 'indigo' // Can be any Tailwind color
	} = $props();

	// Map to determine which SVG icon to use
	const icons = {
		default: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`,
		settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
		message: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
		calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>`,
		currency: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><path d="M16 12H8"></path><path d="M10 16c.5 0 1.5-2 2-4 .5-2 1.5-4 2-4"></path></svg>`,
		todo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="m9 16 2 2 4-4"></path></svg>`
	};

	// Map colors to Tailwind classes
	const colorClasses = {
		indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
		purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
		blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
		green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300',
		red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
		orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
		yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300',
		pink: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
		teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300'
	};

	// Default to indigo if color not found
	const iconClass = colorClasses[color] || colorClasses.indigo;

	let hovering = $state(false);
</script>

<div
	role="article"
	class="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}
>
	<!-- Decorative background pattern -->
	<div class="absolute top-0 right-0 w-32 h-32 opacity-10">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="128"
			height="128"
			viewBox="0 0 24 24"
			fill="currentColor"
			class="text-slate-400 dark:text-slate-600"
		>
			<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
		</svg>
	</div>

	<div class="p-6 relative z-10">
		<div class="flex items-start gap-4">
			<div class="flex-shrink-0">
				<div
					class="{iconClass} rounded-lg w-12 h-12 flex items-center justify-center transition-all"
					class:scale-110={hovering}
				>
					<!-- Icon goes here -->
					{@html icons[icon] || icons.default}
				</div>
			</div>

			<div class="flex-1">
				<h3 class="font-semibold text-xl mb-2 text-slate-800 dark:text-white">{title}</h3>
				<p class="text-slate-600 dark:text-slate-300">{description}</p>

				<!-- Slot for additional content -->
				<div class="mt-4">
					<slot></slot>
				</div>
			</div>
		</div>
	</div>
</div>
