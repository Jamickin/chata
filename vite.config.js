import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dns from 'node:dns';

export default defineConfig({
	// server: {
	// 	host: '0.0.0.0' // Bind to all network interfaces, or use your local IP
	// },
	plugins: [sveltekit()]
});
