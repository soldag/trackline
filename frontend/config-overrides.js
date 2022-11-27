module.exports = {
  devServer: (configFunction) => (proxy, allowedHost) => {
    const config = configFunction(proxy, allowedHost);

    config.client.overlay = false;

    return config;
  },
};
