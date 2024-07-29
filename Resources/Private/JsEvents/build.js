const esbuild = require('esbuild');
const isWatch = process.argv.includes('--watch');

/** @type {import("esbuild").BuildOptions} */
const options = {
	logLevel: "info",
	bundle: true,
	minify: true,
	target: "es2020",
	sourcemap: 'linked',
	entryPoints: {"Plugin": "src/index.js"},
	loader: {
		".js": "tsx",
	},
	alias: require("@neos-project/neos-ui-extensibility/extensibilityMap.json"),
	outdir: "../../Public/JsEvents",
}

if (isWatch) {
	esbuild.context(options).then((ctx) => ctx.watch())
} else {
	esbuild.build(options)
}
