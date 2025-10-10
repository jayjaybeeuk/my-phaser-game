const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
        { from: 'index.html', to: 'index.html' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 8080,
    hot: true,
    liveReload: true,
    open: true,
    watchFiles: ['src/**/*', 'assets/**/*', 'index.html'],
    client: {
      logging: 'info',
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};
