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
	<div>
		<label for="amount">Amount</label>
		<input id="amount" type="number" bind:value={$amount} min="0" />
	</div>
	<div>
		<label for="fromCurrency">From Currency</label>
		<select id="fromCurrency" bind:value={$fromCurrency}>
			{#each $currencies as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="toCurrency">To Currency</label>
		<select id="toCurrency" bind:value={$toCurrency}>
			{#each $currencies as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
	<div>
		<button onclick={convert}> Convert </button>
		<button onclick={fetchExchangeRates} disabled={loading}> Refresh Rates </button>
	</div>
	{#if $result}
		<p>
			{$amount}
			{$fromCurrency} = {$result}
			{$toCurrency}
		</p>
	{/if}
</section>
