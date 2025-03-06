<script>
	import Todo from '$lib/components/Todo.svelte';
	import CurrencyConverter from '$lib/components/CurrencyConverter.svelte';

	let showTodo = false;
	let showConverter = false;

	function toggleTodo() {
		showTodo = !showTodo;
	}

	function toggleConverter() {
		showConverter = !showConverter;
	}
</script>

<h2>Misc Projects</h2>
<section>
	<h3>Todo</h3>
	<section>
		<button aria-label="showTodo" onclick={toggleTodo}>Show Todo</button>
		{#if showTodo}
			<Todo />
		{/if}
	</section>
	<h3>Converter</h3>
	<section>
		<button aria-label="showConverter" onclick={toggleConverter}>Show Converter</button>
		{#if showConverter}
			<CurrencyConverter />
		{/if}
	</section>
</section>
