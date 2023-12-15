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

  onDisciplineSelect(e) {
    console.log(e.detail)
    const disciplineFilter = e.detail
    this.filterDiscipline(disciplineFilter)
  },

  filterDiscipline(disciplineFilter) {
    const { routeSets, translations } = this.data
    console.log(routeSets)
    if (disciplineFilter === translations.all_disciplines) {
      this.setData({
        filteredRouteSets: routeSets
      });
    } else {
      // Filter routeSets based on disciplineFilter
      const filteredRoutes = routeSets.filter(route => route.discipline === disciplineFilter);

      this.setData({
        filteredRouteSets: filteredRoutes
      });
    }
  },

  onSetClick(e) {
    const { setId } = e.currentTarget.dataset
    console.log('SetId:')
    console.log(setId)
    wx.navigateTo({
      url: '/pages/admin/set-info/index?setId=' + encodeURIComponent(setId)
    })
  },

  onAddSetClick(e) {
    wx.navigateTo({
      url: '/pages/admin/create-set/index'
    })
  },

  onLoad(options) {
    const { event_id, language } = getApp().globalData;
    const translations = require(`./${language}.js`)

    this.setData({ 
      translations, 
      disciplineFilter: translations.all_disciplines,
      language
    })

    wx.cloud.callFunction({
      name: 'get-route-sets',
      data:{
        event_id
      }
    }).then(getRouteSetsResult => {
      console.log("Get Route Sets:")
      console.log(getRouteSetsResult)
  
      const { route_sets } = getRouteSetsResult.result
      
      this.setData({
        routeSets: route_sets,
        filteredRouteSets: route_sets
      })
    })
  },

  onShow() {
    const { disciplines } = getApp().globalData
    const { translations } = this.data
  
    const formattedDisciplines = disciplines.concat(translations.all_disciplines).map(discipline => ({
      text: discipline,
      value: discipline
    }))

    this.setData({
      disciplines,
      formattedDisciplines
    })
  }
})
