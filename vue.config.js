module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false, // Disable source maps in production
  devServer: {
    host: process.env.VUE_APP_FRONTEND_HOST || '0.0.0.0',
    port: process.env.VUE_APP_FRONTEND_PORT || 8080,
    open: true, // Automatically open browser
  },
};
