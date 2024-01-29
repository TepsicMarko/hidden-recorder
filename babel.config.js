module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // TODO: fix import alias
    plugins: [
      [
        require.resolve("babel-plugin-module-resolver"),
        {
          root: ["."],
          alias: {
            "@": "./src",
          },
        },
      ],
    ],
  };
};
