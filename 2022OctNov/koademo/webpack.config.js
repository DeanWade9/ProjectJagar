const path = require('path')
const ndoeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const webpackconfig = {
  target: 'node',
  mode: 'development',
  entry: {
    server: path.join(__dirname, 'src/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, './dist'),
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: [path.join(__dirname, '/node_modules')],
      },
    ],
  },
  externals: [ndoeExternals()], // 排除不会使用到的node模块
  plugins: [new CleanWebpackPlugin()],
  node: {
    console: true,
    global: true,
    process: true,
    Buffer: true,
    __filename: true,
    __dirname: true,
    setImmediate: true,
    path: true,
  },
}

module.exports = webpackconfig
