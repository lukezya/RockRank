import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * Page initial data
   */
  data: {
    setName: '',
    discipline: '',
    showDisciplinePopup: false,
    routes: [],
    showAddRoute: false,
    routeType: '',
    routeName: '',
    numberZones: '',
    numberHolds: '',
    editMode: false,
    updateLoading: false
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onSetNameInput(e) {
    this.setData({
      setName: e.detail.value
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
    this.setData({
      discipline: selectedDiscipline,
      showDisciplinePopup: false      
    })
  },

  onDeleteRoute(e) {
    const { routeIndex } = e.currentTarget.dataset
    const { routes } = this.data
    routes.splice(routeIndex, 1)

    this.setData({ routes })
  },

  onAddRouteClick(e) {
    this.setData({ showAddRoute: true })
  },

  onAddRouteClose(e) {
    this.setData({ showAddRoute: false })
  },

  onRouteNameInput(e) {
    this.setData({
      routeName: e.detail.value
    })
  },

  onNumberZonesInput(e) {
    this.setData({
      numberZones: e.detail.value
    })
  },

  onNumberHoldsInput(e) {
    this.setData({
      numberHolds: e.detail.value
    })
  },

  onRouteTypeChange(e) {
    this.setData({ routeType: e.detail })
  },

  onAddRouteAdd(e) {
    const currRoutes = this.data.routes

    const {routeName, routeType, translations} = this.data

    if (!routeName || !routeType) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    if (routeType==='Bouldering') {
      if (!this.data.numberZones) {
        Toast.fail({
          message: translations.all_fields,
          selector: '#toasted'
        });
        return;
      }
      currRoutes.push({
        routeName: routeName,
        routeType: routeType,
        numberZones: this.data.numberZones
      })
    } else if (routeType === 'Lead') {
      if (!this.data.numberHolds) {
        Toast.fail({
          message: translations.all_fields,
          selector: '#toasted'
        });
        return;
      }
      currRoutes.push({
        routeName: routeName,
        routeType: routeType,
        numberHolds: this.data.numberHolds
      })
    } else {
      currRoutes.push({
        routeName: routeName,
        routeType: routeType,
      })
    }

    this.setData({
      routes: currRoutes,
      routeName: '',
      routeType: '',
      numberZones: '',
      numberHolds: '',
      showAddRoute: false
    })
  },

  onEditClick(e) {
    this.setData({
      editMode: true
    })
  },

  async onDoneClick(e) {
    const { setName, discipline, routes, set_id } = this.data
    const { event_id } = getApp().globalData
    if (!setName || !discipline) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    this.setData({updateLoading:true})
    const updateRouteSetResult = await wx.cloud.callFunction({
      name: 'update-route-set',
      data: {
        event_id,
        set_id,
        set_name: setName,
        discipline,
        routes
      }
    })

    console.log("Update Route Set Result:")
    console.log(updateRouteSetResult.result)
    
    const pages = getCurrentPages();
    console.log("Current Pages:")
    console.log(pages)
    const prevPage = pages[pages.length - 2]
    const { routeSets, disciplineFilter } = prevPage.data
    const { updatedIndex } = updateRouteSetResult.result
    routeSets[updatedIndex].set_name = setName
    routeSets[updatedIndex].discipline = discipline
    prevPage.setData({
      routeSets
    })
    prevPage.filterDiscipline(disciplineFilter)

    this.setData({
      updateLoading: false,
      editMode: false
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const set_id = decodeURIComponent(options.setId)
    const { event_id, disciplines, language } = getApp().globalData

    wx.cloud.callFunction({
      name: 'get-set-info',
      data: {
        event_id,
        set_id
      }
    }).then(getSetInfoResult => {
      const { set_name, discipline, routes } = getSetInfoResult.result
      const translations = require(`./${language}.js`)

      this.setData({
        disciplines,
        setName: set_name,
        discipline,
        routes,
        set_id,
        translations
      })
    })
  }
})