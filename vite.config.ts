import * as path from "node:path";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
	],
	base: "/",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@/elements": path.resolve(__dirname, "src/elements"),
			"@/components": path.resolve(__dirname, "src/components"),
			"@/patterns": path.resolve(__dirname, "src/patterns"),
		},
	},
});
