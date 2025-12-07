module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      targets: {
        "safari": "12"
      },
      useBuiltIns: 'entry',
      corejs: 3
    }]
  ]
}
