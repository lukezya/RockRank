// pages/admin/create-event/index.js
import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * Page initial data
   */
  data: {
    eventName: "",
    eventLocation: "",
    imageList: [],
    showCalendar: false,
    confirmedDate: '',
    selectedDisciplines: [],
    categories: '',
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

  async onCreateEvent(e) {
    const {categories, selectedDisciplines, startDate, endDate, eventLocation, eventName, imageList} = this.data
    // check if all data is filled
    if (!categories || selectedDisciplines.length == 0 || !startDate || !endDate || !eventLocation || !eventName || imageList.length == 0) {
      Toast.fail({
        message: 'Please fill in all fields',
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
          categories: categoriesList
        }
      })
      
      console.log("Cloud Function Results:")
      console.log(createEventCollectionResult.result)
      this.setData({creationLoading: false})

      wx.navigateBack({
        delta: 1,
        success: () => {
          const pages = getCurrentPages();
          console.log("Pages")
          console.log(pages)
          const prevPage = pages[pages.length - 1];
          const { event_id } = createEventCollectionResult.result
          const startDateFormatted = prevPage.formatDate(startDate);
          const endDateFormatted = prevPage.formatDate(endDate);
          console.log("Prev Page")
          console.log(prevPage)
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
        },
      });
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