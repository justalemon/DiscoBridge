const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { IgnorePlugin } = require("webpack");

module.exports = {
  entry: {
    server: "./server.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    iife: false,
  },
  target: "node16",
  optimization: {
    minimize: false,
  },
  plugins: [
    new IgnorePlugin({
      resourceRegExp: /pako/
    }),
    new IgnorePlugin({
      resourceRegExp: /zlib-sync/
    }),
    new IgnorePlugin({
      resourceRegExp: /erlpack/
    }),
    new IgnorePlugin({
      resourceRegExp: /ffmpeg-static/
    }),
    new CopyPlugin({
      patterns: [
        "fxmanifest.lua",
      ],
    }),
  ],
};
