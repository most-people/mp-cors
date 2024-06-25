// build.js
const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/server.ts'], // 你的 Fastify 应用入口文件
    bundle: true,
    platform: 'node',
    outfile: 'dist/server.js',
    minify: true,
    // sourcemap: true, // 可选：生成 source map 文件
}).catch(() => process.exit(1));
