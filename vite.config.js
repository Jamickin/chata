import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dns from 'node:dns';

dns.setDefaultResultOrder('verbatim');
export default defineConfig({
	server: {
		host: true,
		allowedHosts: ['https://chadz.co.za', 'https://www.chadz.co.za']
	},
	plugins: [sveltekit()]
});
