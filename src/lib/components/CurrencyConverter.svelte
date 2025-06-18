<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Loading from './Loading.svelte';

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
			loading = true;
			const res = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`);
			const data = await res.json();
			exchangeRates.set(data.data);
			currencies.set(Object.keys(data.data));
			localStorage.setItem(storageKey, JSON.stringify(data.data));
		} catch (error) {
			console.error('Failed to fetch exchange rates:', error);
		} finally {
			loading = false;
		}
	}

	function convert() {
		const rates = $exchangeRates;
		const rate = rates[$toCurrency] / rates[$fromCurrency];
		result.set(($amount * rate).toFixed(2));
	}

	// Last update timestamp
	let lastUpdate = $state('');
	$effect(() => {
		const storedRates = localStorage.getItem(storageKey);
		if (storedRates) {
			const timestamp = localStorage.getItem(storageKey + '_time') || Date.now();
			const date = new Date(parseInt(timestamp));
			lastUpdate = date.toLocaleString();
		}
	});

	// Save timestamp when updating rates
	function updateRates() {
		fetchExchangeRates();
		localStorage.setItem(storageKey + '_time', Date.now().toString());
	}
</script>

<div class="currency-converter">
	{#if loading}
		<Loading />
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label for="amount" class="block mb-1 font-medium">Amount</label>
				<input id="amount" type="number" bind:value={$amount} min="0.01" step="0.01" />
			</div>

			<div class="form-control">
				<label for="fromCurrency" class="block mb-1 font-medium">From Currency</label>
				<select id="fromCurrency" bind:value={$fromCurrency}>
					{#each $currencies as currency}
						<option value={currency}>{currency}</option>
					{/each}
				</select>
			</div>

			<div class="form-control">
				<label for="toCurrency" class="block mb-1 font-medium">To Currency</label>
				<select id="toCurrency" bind:value={$toCurrency}>
					{#each $currencies as currency}
						<option value={currency}>{currency}</option>
					{/each}
				</select>
			</div>

			<div class="form-control button-group">
				<button class="good-button" onclick={convert} disabled={loading}> Convert </button>
				<button class="toggle-button" disabled={loading} onclick={updateRates}>
					{loading ? 'Loading...' : 'Refresh Rates'}
				</button>
			</div>
		</div>

		{#if $result}
			<div class="result-card mt-4 p-4 border rounded-md bg-slate-700 text-center">
				<p class="font-bold text-xl">
					{$amount.toLocaleString()}
					{$fromCurrency} = {parseFloat($result).toLocaleString()}
					{$toCurrency}
				</p>
			</div>
		{/if}

		{#if lastUpdate}
			<p class="text-sm mt-2 text-center opacity-70">
				Rates last updated: {lastUpdate}
			</p>
		{/if}
	{/if}
</div>
