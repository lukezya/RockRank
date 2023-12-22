Page({

  /**
   * Page initial data
   */
  data: {
    zoneOnAttempt: 0,
    topOnAttempt: 0,
    startX: 0,
  },

  touchstart(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
    });
  },

  touchend(e) {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - this.data.startX;

    if (deltaX > 50) {
      wx.navigateBack();
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const zoneOnAttempt = decodeURIComponent(options.zoneOnAttempt)
    const topOnAttempt = decodeURIComponent(options.topOnAttempt)

    this.setData({
      zoneOnAttempt,
      topOnAttempt
    })
  }
})