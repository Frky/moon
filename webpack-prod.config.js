var path = require("path")
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')


var config = {
  context: __dirname,

  entry: {
    'app': './website/static/website/js/index',
  },

  output: {
    path: path.resolve('./website/static/dist/'),
    filename: "[name].bundle.js"
  },

  plugins: [],

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel-loader?presets[]=react&presets[]=es2015']
      }
    ]
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true
      }
    })
  )
}

module.exports = config;