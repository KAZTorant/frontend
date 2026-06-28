module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  devServer: {
    host: process.env.VUE_APP_FRONTEND_HOST || '192.168.1.121',
    port: process.env.VUE_APP_FRONTEND_PORT || 8080,
    open: true,
  },
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.plugin('define').tap((definitions) => {
        Object.assign(definitions[0], {
          'process.env.VUE_APP_API_BASE_URL': JSON.stringify(
            process.env.VUE_APP_API_BASE_URL || 'https://kazza.qr-menu.cc'
          ),
          'process.env.VUE_APP_FRONTEND_URL': JSON.stringify(
            process.env.VUE_APP_FRONTEND_URL || 'https://kazza-front.qr-menu.cc'
          ),
        });
        return definitions;
      });
    }
  },
};
