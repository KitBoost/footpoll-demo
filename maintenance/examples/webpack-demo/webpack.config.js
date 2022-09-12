const path = require('path');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new MergeIntoSingleFilePlugin({
      "bundle.js": [
        path.resolve(__dirname, '1.js'),
        path.resolve(__dirname, '2.js')
      ],
    })
  ]
};