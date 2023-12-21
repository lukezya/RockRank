import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * Page initial data
   */
  data: {
    discipline: '',
    routeSetName:'',
    showCategoryPopup: false,
    showDisciplinePopup: false,
    selectedGroupIndexes: [],
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onRouteSetsShow(e) {
    this.setData({showRouteSetsPopup: true})
  },

  onRouteSetsClose(e) {
    this.setData({showRouteSetsPopup: false})
  },

  onRouteSetsCancel(e) {
    this.setData({showRouteSetsPopup: false})
  },

  onRouteSetsConfirm(e) {
    const selectedRouteSet = e.detail.value
    console.log(selectedRouteSet)
    this.setData({
      routeSetName: selectedRouteSet.set_name,
      routeSet: selectedRouteSet,
      showRouteSetsPopup: false      
    })
  },

  onDisciplinesShow(e) {
    this.setData({showDisciplinePopup: true})
  },

  onDisciplinesClose(e) {
    this.setData({showDisciplinePopup: false})
  },

  onDisciplineCancel(e) {
    this.setData({showDisciplinePopup: false})
  },

  onDisciplineConfirm(e) {
    const selectedDiscipline = e.detail.value
    const {routeSets, climberGroups} = this.data

    const filteredSets = routeSets.filter(routeSet => routeSet.discipline === selectedDiscipline)
    const filteredGroups = climberGroups.filter(group => group.discipline === selectedDiscipline)

    this.setData({
      discipline: selectedDiscipline,
      filteredSets,
      filteredGroups,
      showDisciplinePopup: false      
    })
  },

  onGroupSelect(e) {
    this.setData({
      selectedGroupIndexes: e.detail
    })
  },

  async onCreateSessionClick(e) {
    const { discipline, routeSet, selectedGroupIndexes, filteredGroups, translations } = this.data
    if (!discipline || !routeSet || selectedGroupIndexes.length == 0) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }
    this.setData({creationLoading: true})
    
    const selectedClimberGroups = selectedGroupIndexes.map(index => filteredGroups[parseInt(index)]);
    console.log("Selected Climber Groups:")
    console.log(selectedClimberGroups)
    const { event_id } = getApp().globalData
    const createSessionResults = await wx.cloud.callFunction({
      name: 'create-session-collection',
      data: {
        discipline,
        routeSet,
        selectedClimberGroups,
        event_id
      }
    })
    console.log("createSessionResults:")
    console.log(createSessionResults)
    const { session_id } = createSessionResults.result

    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    const { sessions, categoryFilter, disciplineFilter } = prevPage.data
    const newSessions = [{ 
      discipline,
      status:'Open',
      session_id, groups: selectedClimberGroups
    }].concat(sessions)

    prevPage.setData({
      sessions: newSessions
    });
    prevPage.onFilterSelect(categoryFilter, disciplineFilter)
    this.setData({creationLoading: false})
    wx.navigateBack()
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const { event_id, disciplines, language } = getApp().globalData
    const translations = require(`./${language}.js`)

    Promise.all([
      wx.cloud.callFunction({ name: 'get-route-sets', data: { event_id } }),
      wx.cloud.callFunction({ name: 'get-climber-groups', data: { event_id } })
    ]).then(results => {
      const [getRouteSetsResult, getClimberGroupsResult] = results;

      const { route_sets } = getRouteSetsResult.result;
      const { climber_groups } = getClimberGroupsResult.result;

      this.setData({
        disciplines,
        routeSets: route_sets,
        climberGroups: climber_groups,
        filteredSets: route_sets,
        filteredGroups: climber_groups,
        translations
      });
    })
  }
})