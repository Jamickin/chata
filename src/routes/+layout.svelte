<script>
	let { children } = $props();
	import '../app.css';
</script>

<header>
	<img src="/LOGO.png" alt="My Logo" />
	<h1 class="lexend-bold">This is my website.</h1>
</header>
<main>{@render children()}</main>
<footer><p>This is the start of something brand new and exciting</p></footer>

<style>
	header {
		display: flex;
		align-items: center;
		padding: 1rem;
		background-color: #f0f0f0;
	}
	header img {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		margin-right: 1rem;
	}
	footer {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		text-align: center;
		padding: 1rem;
		background-color: #f0f0f0;
	}
</style>
