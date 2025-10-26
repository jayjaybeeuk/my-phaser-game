const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: argv.mode || 'development',
    entry: './src/index.ts',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    target: 'web',
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
      publicPath: isProduction ? './' : '/', // Dev uses /, production uses ./
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'assets', to: 'assets' },
          { 
            from: 'index.html', 
            to: 'index.html',
            transform(content) {
              // In production, use relative path for Electron
              if (isProduction) {
                return content.toString().replace('src="./bundle.js"', 'src="./bundle.js"');
              }
              return content;
            }
          },
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
};
