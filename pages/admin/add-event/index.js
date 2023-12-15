Page({

  onReturnHome(e) {
    wx.reLaunch({
      url: '/pages/login/index',
    })
  },

  onEventClick(e) {
    const eventId = e.currentTarget.dataset.eventId
    getApp().globalData.event_id = eventId;

    wx.switchTab({
      url: '/pages/admin/event-info/index'
    })
  },

  onAddEventClick(e) {
    wx.navigateTo({
      url: '/pages/admin/create-event/index'
    })
  },

  onLoad(options) {
    wx.cloud.callFunction({
      name: 'get-events'
    }).then(getEventsResult => {
      console.log('getEventsResult')
      console.log(getEventsResult)
      const { events } = getEventsResult.result

      const { language } = getApp().globalData
      const translations = require(`./${language}.js`)
      const options = { day: 'numeric', month: 'short' };
      
      events.forEach(event => {
        const startDateFormatted = (new Date(event.start_date)).toLocaleDateString(translations.locale, options);
        const endDateFormatted = (new Date(event.end_date)).toLocaleDateString(translations.locale, options);
        event.dateRange = `${startDateFormatted} - ${endDateFormatted}`;
      })
  
      this.setData({ events, translations })
    })
    
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    return `${month}月${day}日`;
  }
})