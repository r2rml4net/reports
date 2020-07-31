/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const merge = require('webpack-merge');
const { createDefaultConfig } = require('@open-wc/building-webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(
  createDefaultConfig({
    input: path.resolve(__dirname, './index.html'),
  }),
  {
    resolve: {
      extensions: ['.ts', '.mjs', '.js', '.json'],
      alias: {
        stream: 'readable-stream',
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['raw-loader'],
        },
      ],
    },
    node: {
      crypto: true,
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: 'src/CNAME' }],
      }),
    ],
  }
);
