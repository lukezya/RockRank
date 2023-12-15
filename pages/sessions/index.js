// pages/sessions/index.js
Page({

  /**
   * Page initial data
   */
  data: {
  
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onReturnHome(e) {
    wx.reLaunch({
      url: '/pages/login/index',
    })
  },

  onCategorySelect(e) {
    const categoryFilter = e.detail
    const { disciplineFilter } = this.data

    this.setData({categoryFilter})

    this.onFilterSelect(categoryFilter, disciplineFilter)
  },

  onDisciplineSelect(e) {
    const disciplineFilter = e.detail
    const { categoryFilter } = this.data
    this.setData({disciplineFilter})
    this.onFilterSelect(categoryFilter, disciplineFilter)
  },

  onFilterSelect(categoryFilter, disciplineFilter) {
    const { sessions, translations } = this.data;
    if (categoryFilter === translations.all_categories && disciplineFilter === translations.all_disciplines) {
      this.setData({
        filteredSessions: sessions
      });
    } else {
      const filteredSessions = sessions.filter(session =>
        (categoryFilter === translations.all_categories || session.groups.some(group => group.category === categoryFilter)) &&
        (disciplineFilter === translations.all_disciplines || session.discipline === disciplineFilter)
      );
  
      this.setData({
        filteredSessions
      });
    }
  },

  onSessionSelect(e) {
    getApp().globalData.session_id = e.currentTarget.dataset.sessionId
    wx.navigateTo({
      url: '/pages/route-climber/index'
    })
  },
  
  onLoad(options) {
    const { event_id, categories, disciplines, language } = getApp().globalData
    
    wx.cloud.callFunction({
      name: 'get-sessions',
      data:{
        event_id
      }
    }).then(getSessionsResult => {
      console.log("Get Sessions:")
      console.log(getSessionsResult)
  
      const { sessions } = getSessionsResult.result
      const openSessions = sessions.filter(session => session.status === 'Open')
      const translations = require(`./${language}.js`)
  
      const formattedCategories = categories.concat(translations.all_categories).map(category => ({
        text: category,
        value: category
      }))
      const formattedDisciplines = disciplines.concat(translations.all_disciplines).map(discipline => ({
        text: discipline,
        value: discipline
      }))
  
      this.setData({
        formattedCategories,
        formattedDisciplines,
        sessions: openSessions,
        filteredSessions: openSessions,
        translations,
        categoryFilter: translations.all_categories,
        disciplineFilter: translations.all_disciplines
      })
    })    
  }
})