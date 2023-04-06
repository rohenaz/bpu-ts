const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bpu.js",
    library: "bpu",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: {
    "@ts-bitcoin/core": {
      commonjs: "@ts-bitcoin/core",
      commonjs2: "@ts-bitcoin/core",
      amd: "@ts-bitcoin/core",
      root: "@ts-bitcoin/core",
    },
    "bitcoind-rpc": {
      commonjs: "bitcoind-rpc",
      commonjs2: "bitcoind-rpc",
      amd: "bitcoind-rpc",
      root: "bitcoind-rpc",
    },
    dotenv: {
      commonjs: "dotenv",
      commonjs2: "dotenv",
      amd: "dotenv",
      root: "dotenv",
    },
  },
};
