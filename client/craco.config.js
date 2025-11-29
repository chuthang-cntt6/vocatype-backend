module.exports = {
  devServer: (devServerConfig) => {
    devServerConfig.allowedHosts = ['localhost']; // fix lỗi allowedHosts
    return devServerConfig;
  },
};
