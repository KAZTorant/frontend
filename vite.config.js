// Railpack detects Vite SPAs via vite.config.js and serves dist/ with Caddy.
// Production builds still use vue-cli-service via npm run build.
export default {
  build: {
    outDir: 'dist',
  },
};
