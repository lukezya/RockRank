// pages/admin/event-info/index.js
Page({

  /**
   * Page initial data
   */
  data: {
    editMode: false,
    showMenu: false,
    showCalendar: false,
    confirmedDate: '',
    imageList: [],
    availableDisciplines: [],
    updateLoading: false
  },

  onNameInput(e) {
    this.setData({eventName: e.detail.value})
  },

  onLocationInput(e) {
    this.setData({eventLocation: e.detail.value})
  },

  onCategoryInput(e) {
    this.setData({ categories: e.detail.value })
  },

  onChiefJudgeInput(e) {
    this.setData({chiefJudge: e.detail.value})
  },

  onDeputyChiefJudgeInput(e) {
    this.setData({deputyChiefJudge: e.detail.value})
  },

  onRouteJudgeInput(e) {
    this.setData({routeJudge: e.detail.value})
  },

  onResultsProcessingJudgeInput(e) {
    this.setData({resultsProcessingJudge: e.detail.value})
  },

  onImageUpload(e) {
    this.setData({imageList: [{url: e.detail.file.url}]})
  },

  onLogoDelete(e) {
    this.setData({imageList: []})
  },

  onCalendarSelect(e) {
    this.setData({ showCalendar: true })
  },

  onCalendarClose(e) {
    this.setData({ showCalendar: false })
  },
  
  onCalendarConfirm(e) {
    const [start, end] = e.detail;
    this.setData({
      eventDateRange: `${this.dateShortHand(start)} - ${this.dateShortHand(end)}`,
      showCalendar: false,
      startDate: start,
      endDate: end
    });
  },

  dateShortHand(date) {
    const { translations } = this.data
    date = new Date(date)
    const options = { day: 'numeric', month: 'short' }
    return date.toLocaleDateString(translations.locale, options);
  },

  onDisciplineChange(e) {
    this.setData({ disciplines: e.detail})
  },

  onEditClick(e) {
    this.setData({
      editMode: true
    })
  },

  async onDoneClick(e) {
    const {categories, disciplines, startDate, endDate, eventLocation, eventName, chiefJudge, deputyChiefJudge, routeJudge, resultsProcessingJudge, imageList, translations} = this.data
    // check if all data is filled
    if (!categories || disciplines.length == 0 || !startDate || !endDate || !eventLocation || !eventName || imageList.length == 0) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    this.setData({updateLoading:true})
    const categoriesList = categories.split('\n')
    const { event_id } = getApp().globalData
    const updateEventInfoResult = await wx.cloud.callFunction({
      name: 'update-event-info',
      data: {
        event_id,
        name: eventName,
        location: eventLocation,
        start_date: startDate,
        end_date: endDate,
        logo_url: imageList[0].url,
        disciplines: disciplines,
        categories: categoriesList,
        chief_judge: chiefJudge,
        deputy_chief_judge: deputyChiefJudge,
        route_judge: routeJudge,
        results_processing_judge: resultsProcessingJudge
      }
    })

    console.log(updateEventInfoResult.result)
    getApp().globalData.disciplines = disciplines;
    getApp().globalData.categories = categoriesList;
  
    this.setData({
      updateLoading: false,
      editMode: false,
    })
  },

  onMenuShow(e) {
    this.setData({ showMenu: true })
  },

  onReturnHome(e) {
    wx.reLaunch({
      url: '/pages/login/index',
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const { event_id, language } = getApp().globalData;
    wx.cloud.callFunction({
      name: 'get-event-info',
      data:{
        event_id
      }
    }).then(getEventResult => {
      const { name, location, start_date, end_date, logo_url, disciplines, categories, chief_judge, deputy_chief_judge, route_judge, results_processing_judge } = getEventResult.result
      
      getApp().globalData.disciplines = disciplines;
      getApp().globalData.categories = categories;

      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

      const translations = require(`./${language}.js`)
      const availableDisciplines = [translations.bouldering, translations.lead, translations.speed, translations.bouldering_and_lead]

      const options = { day: 'numeric', month: 'short' }
      const eventDateRange = (new Date(start_date)).toLocaleDateString(translations.locale, options) + ' - ' + (new Date(end_date)).toLocaleDateString(translations.locale, options)
      
      this.setData({
        eventName: name,
        eventLocation: location,
        startDate: start_date,
        endDate: end_date,
        eventDateRange,
        imageList: [{url: logo_url}],
        disciplines,
        categories: categories.join('\n'),
        maxDate: oneYearFromNow.getTime(),
        chiefJudge: chief_judge,
        deputyChiefJudge: deputy_chief_judge,
        routeJudge: route_judge,
        resultsProcessingJudge: results_processing_judge,
        availableDisciplines,
        translations,
        language
      })
    })
  },
})