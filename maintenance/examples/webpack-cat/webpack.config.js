const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
// see https://www.npmjs.com/package/webpack-merge-and-include-globally

module.exports = {
  mode: 'none',
  entry: './1.js',
  plugins: [
    new MergeIntoSingleFilePlugin({
      files: {
        "bundle.js": [
          './1.js',
          './2.js'        
        ]
      }
    })
  ]
};