// pages/admin/create-event/index.js
import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * Page initial data
   */
  data: {
    eventName: '',
    eventLocation: '',
    imageList: [],
    showCalendar: false,
    confirmedDate: '',
    selectedDisciplines: [],
    categories: '',
    chiefJudge: '',
    deputyChiefJudge: '',
    routeJudge: '',
    resultsProcessingJudge: '',
    creationLoading: false,
    disciplines: []
  },

  onBackClick(e) {
    wx.navigateBack()
  },
  
  onNameInput(e) {
    this.setData({eventName: e.detail.value})
  },

  onLocationInput(e) {
    this.setData({eventLocation: e.detail.value})
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
      confirmedDate: `${this.dateShortHand(start)} - ${this.dateShortHand(end)}`,
      showCalendar: false,
      startDate: start,
      endDate: end
    });
  },

  dateShortHand(date) {
    date = new Date(date);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  onDisciplineChange(e) {
    this.setData({ selectedDisciplines: e.detail })
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

  async onCreateEvent(e) {
    const {categories, selectedDisciplines, startDate, endDate, eventLocation, eventName, chiefJudge, deputyChiefJudge, routeJudge, resultsProcessingJudge, imageList, translations} = this.data
    // check if all data is filled
    if (!categories || selectedDisciplines.length == 0 || !startDate || !endDate || !eventLocation || !eventName || imageList.length == 0) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
    } else {
      this.setData({creationLoading: true})
      // upload event logo
      const fileName = 'event-logos/' + eventName + '_' + startDate.getFullYear() + '.png'
      const uploadedFileResults = await wx.cloud.uploadFile({
        cloudPath: fileName,
        filePath: imageList[0].url
      })

      console.log("Uploaded File Results:")
      console.log(uploadedFileResults)

      // create event collection
      const categoriesList = categories.split('\n')

      const createEventCollectionResult = await wx.cloud.callFunction({
        name: 'create-event-collection',
        data:{
          name: eventName,
          location: eventLocation,
          start_date: startDate,
          end_date: endDate,
          logo_url: uploadedFileResults.fileID,
          disciplines: selectedDisciplines,
          categories: categoriesList,
          chief_judge: chiefJudge,
          deputy_chief_judge: deputyChiefJudge,
          route_judge: routeJudge,
          results_processing_judge: resultsProcessingJudge
        }
      })

      console.log("Cloud Function Results:")
      console.log(createEventCollectionResult.result)

      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      const { event_id } = createEventCollectionResult.result
      const startDateFormatted = prevPage.formatDate(startDate);
      const endDateFormatted = prevPage.formatDate(endDate);
      prevPage.setData({
        events: prevPage.data.events.concat({
          name: eventName,
          location: eventLocation,
          start_date: startDate,
          end_date: endDate,
          logo_url: uploadedFileResults.fileID,
          _id: event_id,
          dateRange: `${startDateFormatted} - ${endDateFormatted}`
        })
      });

      this.setData({creationLoading: false})
      wx.navigateBack();
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const oneYearFromNow = new Date()
    const { language } = getApp().globalData
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    const translations = require(`./${language}.js`)
    const disciplines = [translations.bouldering, translations.lead, translations.speed, translations.bouldering_and_lead]

    this.setData({
      maxDate: oneYearFromNow.getTime(),
      translations,
      disciplines
    })
  },
})