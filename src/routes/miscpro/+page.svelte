<script>
	import Todo from '$lib/components/Todo.svelte';
	import CurrencyConverter from '$lib/components/CurrencyConverter.svelte';

	import Legend from '$lib/components/Legend.svelte';

	let showTodo = $state(false);
	let showConverter = $state(false);
	let showLegend = $state(false);
</script>

<h2>Misc Projects</h2>
<section class="">
	<h3>Todo</h3>
	<button
		class="toggle-button"
		aria-label="showTodo"
		onclick={() => {
			showTodo = !showTodo;
		}}>{!showTodo ? 'Show Todo' : 'Hide Todo'}</button
	>
	{#if showTodo}
		<section>
			<Todo />
		</section>
	{/if}

	<h3>Legend:</h3>
	<button
		class="toggle-button"
		onclick={() => {
			showLegend = !showLegend;
		}}>{!showLegend ? 'Show Legend' : 'Hide Legend'}</button
	>
	{#if showLegend}
		<Legend />
	{/if}

	<h3>Converter</h3>
	<button
		class="toggle-button"
		aria-label="showConverter"
		onclick={() => {
			showConverter = !showConverter;
		}}>{!showConverter ? 'Show Converter' : 'Hide Converter'}</button
	>
	{#if showConverter}
		<section>
			<CurrencyConverter />
		</section>
	{/if}
</section>
