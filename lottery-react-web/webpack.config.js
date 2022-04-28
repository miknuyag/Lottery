const webpack = require('webpack');
module.exports = {
  mode: 'development',
  entry: {
    vendor: ['@babel/ployfill','eventsource-polyfill','react','react-dom'],
    app: ['@babel/polyfill','eventsourcepolyfill','./src/App.js']
  },
  output: {
    path: '/dist',
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      options: {
        presets: [
          [
            '@babel/preset-env', {
              targets: { node: 'current' }, // 노드일 경우만
              modules: 'false',
              useBuiltIns: 'usage'
            }
          ],
          '@babel/preset-react', // 리액트를 쓴다면
          // '@babel/preset-typescript' // 타입스크립트를 쓴다면
        ],
      },
      exclude: ['/node_modules'],
    }],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'), // 아래 EnvironmentPlugin처럼 할 수도 있습니다.
    }),
    new webpack.EnvironmentPlugin({ 'NODE_ENV': 'production' }), // 요즘은 DefinePlugin보다 이렇게 하는 추세입니다.
  ],

  optimization: {
    minimize: true/false,
    splitChunks: {},
    concatenateModules: true,
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.json', '.jsx', '.css'],
    fallback: {
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserifty'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
    }
  },
};

// module.exports = {
//   mode: "production",
//   devtool:"source-map",
//   resolve: {
//     fallback: {
//       assert: require.resolve('assert'),
//       crypto: require.resolve('crypto-browserify'),
//       http: require.resolve('stream-http'),
//       https: require.resolve('https-browserify'),
//       os: require.resolve('os-browserify/browser'),
//       stream: require.resolve('stream-browserify'),
//     },
//   },
// };