Page({

  /**
   * Page initial data
   */
  data: {
    showMenu: false
  },

  onMenuShow(e) {
    this.setData({ showMenu: true })
  },

  onReturnHome(e) {
    wx.reLaunch({
      url: '/pages/login/index',
    })
  },

  onCategorySelect(e) {
    console.log("Category:")
    console.log(e.detail)
    const categoryFilter = e.detail
    const { disciplineFilter } = this.data

    this.setData({categoryFilter})

    this.onFilterSelect(categoryFilter, disciplineFilter)
  },

  onDisciplineSelect(e) {
    console.log("Discipline:")
    console.log(e.detail)
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
    const { sessionId, sessionDiscipline } = e.currentTarget.dataset
    console.log('Selected Session Id:')
    console.log(sessionId)

    console.log('and discipline:')
    console.log(sessionDiscipline)

    wx.navigateTo({
      url: '/pages/admin/view-scores/index?sessionId=' + encodeURIComponent(sessionId)
        + '&sessionDiscipline=' + encodeURIComponent(sessionDiscipline)
    })
  },

  async onCompleteSession(e) {
    const { sessionId } = e.currentTarget.dataset;
    const { categoryFilter, disciplineFilter } = this.data
    const { event_id } = getApp().globalData

    const updateSessionProgressResult = await wx.cloud.callFunction({
      name: 'update-session-progress',
      data: {
        event_id: event_id,
        session_id: sessionId
      }
    })

    console.log("Update Session Progress Result:")
    console.log(updateSessionProgressResult)

    const { session_index } = updateSessionProgressResult.result

    this.setData({
      [`sessions[${session_index}].status`]: 'Completed'
    })

    console.log(this.data)

    this.onFilterSelect(categoryFilter, disciplineFilter)
  },

  onAddSessionClick(e) {
    wx.navigateTo({
      url: '/pages/admin/create-session/index'
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
 
  },

  onShow() {
    const { categories, disciplines, event_id, language } = getApp().globalData
    const translations = require(`./${language}.js`)

    wx.cloud.callFunction({
      name: 'get-sessions',
      data:{
        event_id
      }
    }).then(getSessionsResult => {
      console.log("Get Sessions:")
      console.log(getSessionsResult)
  
      const { sessions } = getSessionsResult.result

      const formattedCategories = categories.concat(translations.all_categories).map(category => ({
        text: category,
        value: category
      }))
      const formattedDisciplines = disciplines.concat(translations.all_disciplines).map(discipline => ({
        text: discipline,
        value: discipline
      }))
  
      this.setData({
        disciplines,
        formattedCategories,
        formattedDisciplines,
        sessions,
        filteredSessions: sessions,
        categoryFilter: translations.all_categories,
        disciplineFilter: translations.all_disciplines,
        translations,
        language
      })
    })
  }
})