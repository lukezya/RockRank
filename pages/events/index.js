// pages/events/index.js
Page({

  /**
   * Page initial data
   */
  data: {

  },

  onReturnHome(e) {
    wx.reLaunch({
      url: '/pages/login/index',
    })
  },

  async onEventClick(e) {
    console.log(e.currentTarget)
    const event_id = e.currentTarget.dataset.eventId

    const getEventInfoResult = await wx.cloud.callFunction({
      name: 'get-event-info',
      data: {
        event_id
      }
    })

    const eventInfo = getEventInfoResult.result
    console.log("getEventInfo results:")
    console.log(eventInfo)

    getApp().globalData.event_id = event_id
    getApp().globalData.categories = eventInfo.categories
    getApp().globalData.disciplines = eventInfo.disciplines

    wx.navigateTo({
      url: '/pages/sessions/index'
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
})