const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  target: "node",
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
  optimization: {
    minimize: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        "fxmanifest.lua",
      ],
    }),
  ],
};
