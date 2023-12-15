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
    const { climberGroups, translations } = this.data;
    if (categoryFilter === translations.all_categories && disciplineFilter === translations.all_disciplines) {
      this.setData({
        filteredClimberGroups: climberGroups
      });
    } else {
      const filteredGroups = climberGroups.filter(climberGroup =>
        (categoryFilter === translations.all_categories || climberGroup.category === categoryFilter) &&
        (disciplineFilter === translations.all_disciplines || climberGroup.discipline === disciplineFilter)
      );
  
      this.setData({
        filteredClimberGroups: filteredGroups
      });
    }
  },

  onClimberGroupClick(e) {
    const { groupId } = e.currentTarget.dataset

    console.log('GroupId:')
    console.log(groupId)

    wx.navigateTo({
      url: '/pages/admin/group-info/index?groupId=' + encodeURIComponent(groupId)
    })
  },

  onAddClimberGroupClick(e) {
    wx.navigateTo({
      url: '/pages/admin/create-group/index'
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    
  },

  onShow() {
    const { categories, disciplines, event_id, language } = getApp().globalData

    wx.cloud.callFunction({
      name: 'get-climber-groups',
      data:{
        event_id
      }
    }).then(getClimberGroupsResult => {
      console.log("Get Climber Groups:")
      console.log(getClimberGroupsResult)
  
      const { climber_groups } = getClimberGroupsResult.result
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
        climberGroups: climber_groups,
        filteredClimberGroups: climber_groups,
        categories,
        formattedCategories,
        disciplines,
        formattedDisciplines,
        categoryFilter: translations.all_categories,
        disciplineFilter: translations.all_disciplines,
        translations,
        language
      })
    })
  }
})