<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<Header />

<main>
	{@render children()}
	<Footer />
</main>

<style>
</style>
