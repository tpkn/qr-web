import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';

const is_production = process.env.NODE_ENV === 'production';

export default defineConfig({
	base: './',
	mode: !is_production,
	build: {
		outDir: './build',
		rollupOptions: {
			output: {
				hashCharacters: 'hex',
				chunkFileNames: 'assets/[name]_[hash].js',
				entryFileNames: 'assets/[name]_[hash].js',
				// Disable hash for some files
				assetFileNames: (file) => /\.(eot|ttf|woff2?)$/i.test(file.name) ? 'assets/[name].[ext]' : 'assets/[name]_[hash].[ext]',
			},
		}
	},
	plugins: [
		vue(),
	],
	resolve: {
		alias: [
			{ find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
			{ find: '@assets', replacement: fileURLToPath(new URL('./src/assets', import.meta.url)) },
			{ find: '@comp', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
			{ find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
			{ find: '@fonts', replacement: fileURLToPath(new URL('./src/fonts', import.meta.url)) },
			{ find: '@images', replacement: fileURLToPath(new URL('./src/images', import.meta.url)) },
			{ find: '@js', replacement: fileURLToPath(new URL('./src/js', import.meta.url)) },
			{ find: '@lib', replacement: fileURLToPath(new URL('./src/lib', import.meta.url)) },
			{ find: '@modules', replacement: fileURLToPath(new URL('./src/modules', import.meta.url)) },
			{ find: '@pages', replacement: fileURLToPath(new URL('./src/pages', import.meta.url)) },
			{ find: '@scss', replacement: fileURLToPath(new URL('./src/scss', import.meta.url)) },
		]
	},
});
