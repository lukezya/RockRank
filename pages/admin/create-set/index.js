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
    showEditRoute: false,
    showAddRoute: false,
    routeType: '',
    selectedRouteType: '',
    routeName: '',
    selectedRouteName: '',
    numberZones: '',
    numberHolds: '',
    selectedNumberZones: '',
    selectedNumberHolds: '',
    selectedRouteIndex: '',
    creationLoading: false,
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

  onEditRouteShow(e) {
    const { routes } = this.data
    const { routeIndex } = e.currentTarget.dataset
    const selectedRoute = routes[routeIndex]

    if (selectedRoute.routeType === 'Bouldering') {
      this.setData({
        showEditRoute: true,
        selectedRouteIndex: routeIndex,
        selectedRouteName: selectedRoute.routeName,
        selectedRouteType: selectedRoute.routeType,
        selectedNumberZones: selectedRoute.numberZones
      })
    } else if (selectedRoute.routeType === 'Lead') {
      this.setData({
        showEditRoute: true,
        selectedRouteIndex: routeIndex,
        selectedRouteName: selectedRoute.routeName,
        selectedRouteType: selectedRoute.routeType,
        selectedNumberHolds: selectedRoute.numberHolds
      })
    } else {
      this.setData({
        showEditRoute: true,
        selectedRouteIndex: routeIndex,
        selectedRouteName: selectedRoute.routeName,
        selectedRouteType: selectedRoute.routeType
      })
    }
  },

  onEditRouteClose(e) {
    this.setData({ showEditRoute: false })
  },

  onSelectedRouteNameInput(e) {
    this.setData({
      selectedRouteName: e.detail.value
    })
  },

  onSelectedNumberZonesInput(e) {
    this.setData({
      selectedNumberZones: e.detail.value
    })
  },

  onSelectedNumberHoldsInput(e) {
    this.setData({
      selectedNumberHolds: e.detail.value
    })
  },

  onSelectedRouteTypeChange(e) {
    this.setData({ selectedRouteType: e.detail })
  },

  onEditRouteUpdate() {
    const { routes, selectedRouteIndex, selectedRouteName, selectedRouteType, selectedNumberZones, selectedNumberHolds, translations } = this.data

    if (!selectedRouteName || !selectedRouteType) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    if (selectedRouteType === 'Bouldering') {
      routes[selectedRouteIndex] = {
        routeName: selectedRouteName,
        routeType: selectedRouteType,
        numberZones: selectedNumberZones
      }
    } else if (selectedRouteType === 'Lead') {
      routes[selectedRouteIndex] = {
        routeName: selectedRouteName,
        routeType: selectedRouteType,
        numberHolds: selectedNumberHolds
      }
    } else {
      routes[selectedRouteIndex] = {
        routeName: selectedRouteName,
        routeType: selectedRouteType
      }
    }

    this.setData({ routes, showEditRoute: false })
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

  async onCreateSetClick(e) {
    const { setName, discipline, routes, translations } = this.data
    if (!setName || !discipline) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    this.setData({creationLoading: true})
    const { event_id } = getApp().globalData
    const createSetResults = await wx.cloud.callFunction({
      name: 'create-route-set',
      data: {
        setName,
        discipline,
        routes,
        event_id
      }
    })

    console.log(createSetResults)
    const { set_id } = createSetResults.result
    this.setData({creationLoading: false})

    wx.navigateBack({
      delta: 1,
      success: function () {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 1];
        const { routeSets, disciplineFilter } = prevPage.data
        const newRouteSets = [{ set_id, set_name: setName, discipline }].concat(routeSets)
        prevPage.setData({
          routeSets: newRouteSets
        });
        prevPage.filterDiscipline(disciplineFilter)
      },
    });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const { disciplines, language } = getApp().globalData
    const translations = require(`./${language}.js`)

    this.setData({
      disciplines,
      translations
    })
  }
})