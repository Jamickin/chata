import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

import dns from 'node:dns';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()]
});
