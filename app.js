// app.js
App({
  onLaunch() {
    const envId = require('./config.js').envId

    wx.cloud.init({
      env: envId,
      traceUser: true
    })

    this.globalData = {
      event_id: '',
      session_id: '',
      disciplines: [],
      categories: [],
      language: ''
    }
  }

})
