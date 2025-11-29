module.exports = {
    entry: './popup-entry.jsx',
    output: {
      filename: 'popup-bundle.js'
    },
    module: {
      rules: [{
        test: /\.jsx?$/,
        use: 'babel-loader'
      }]
    }
  };
  