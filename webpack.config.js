var path = require("path")
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')

var hostname = process.argv[2] || 'localhost:3000';


module.exports = {
  context: __dirname,

  entry: [
    'webpack-dev-server/client?http://' + hostname,
    'webpack/hot/only-dev-server',
    './website/static/website/js/index',
  ],

  output: {
    path: path.resolve('./website/static/dist/'),
    filename: "[name]-[hash].js",
    publicPath: 'http://' + hostname + '/website/static/dist/'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(), // don't reload if there is an error
    new BundleTracker({filename: './webpack-stats.json'}),
  ],

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
