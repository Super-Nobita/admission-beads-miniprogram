App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        traceUser: true
      })
    }
  },

  globalData: {
    appName: '拼豆录取通知书'
  }
})
