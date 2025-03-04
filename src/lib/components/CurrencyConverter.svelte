<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const amount = writable(1);
	const fromCurrency = writable('USD');
	const toCurrency = writable('EUR');
	const result = writable('');
	const currencies = writable([]);
	const exchangeRates = writable({});
	let loading = $state(false);

	const apiKey = 'fca_live_DpWf8A55FgXQ6XZaYOK0Z6va6f65mq2VDbJHYrIb';
	const storageKey = 'exchangeRates';

	onMount(() => {
		const storedRates = localStorage.getItem(storageKey);
		if (storedRates) {
			const data = JSON.parse(storedRates);
			exchangeRates.set(data);
			currencies.set(Object.keys(data));
		} else {
			fetchExchangeRates();
		}
	});

	async function fetchExchangeRates() {
		try {
			const res = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`);
			const data = await res.json();
			exchangeRates.set(data.data);
			currencies.set(Object.keys(data.data));
			localStorage.setItem(storageKey, JSON.stringify(data.data));
		} catch (error) {
			console.error('Failed to fetch exchange rates:', error);
		}
	}

	function convert() {
		const rates = $exchangeRates;
		const rate = rates[$toCurrency] / rates[$fromCurrency];
		result.set(($amount * rate).toFixed(2));
	}
</script>

<section>
	<h1>Currency Converter</h1>
	<div class="mb-4">
		<label for="amount" class="block text-sm font-medium text-slate-700 mb-1">Amount</label>
		<input id="amount" type="number" bind:value={$amount} min="0" class="w-full px-3 py-2 border" />
	</div>
	<div class="mb-4">
		<label for="fromCurrency" class="block text-sm font-medium text-slate-700 mb-1"
			>From Currency</label
		>
		<select
			id="fromCurrency"
			bind:value={$fromCurrency}
			class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
		>
			{#each $currencies as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
	<div class="mb-4">
		<label for="toCurrency" class="block text-sm font-medium text-slate-700 mb-1">To Currency</label
		>
		<select
			id="toCurrency"
			bind:value={$toCurrency}
			class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
		>
			{#each $currencies as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
	<div class="flex justify-between">
		<button
			onclick={convert}
			class="w-full bg-orange-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
		>
			Convert
		</button>
		<button
			onclick={fetchExchangeRates}
			disabled={loading}
			class="w-full ml-2 bg-slate-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
		>
			Refresh Rates
		</button>
	</div>
	{#if $result}
		<p class="mt-4 text-center text-lg">
			{$amount}
			{$fromCurrency} = {$result}
			{$toCurrency}
		</p>
	{/if}
</section>
