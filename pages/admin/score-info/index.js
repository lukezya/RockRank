import Toast from '@vant/weapp/toast/toast'

Page({

  /**
   * Page initial data
   */
  data: {
    showRouteScore: false,
    updateLoading: false,
    attemptsMadeString: '',
    zoneOnAttemptString: '',
    topOnAttemptString: '',
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onRouteScoreSelect(e) {
    const { routeIndex } = e.currentTarget.dataset
    const selectedRouteScore = this.data.routes[routeIndex]

    this.setData({
      showRouteScore: true,
      selectedRouteScore,
      selectedRouteIndex: routeIndex,
      attemptsMadeString: selectedRouteScore.attemptsMade.toString(),
      zoneOnAttemptString: selectedRouteScore.zoneOnAttempt.toString(),
      topOnAttemptString: selectedRouteScore.topOnAttempt.toString()
    })
  },

  onRouteClose() {
    this.setData({
      showRouteScore: false,
    })
  },

  onAttemptsInput(e) {
    this.setData({
      attemptsMadeString: e.detail.value
    })
  },

  onZoneAttemptInput(e) {
    this.setData({
      zoneOnAttemptString: e.detail.value
    })
  },

  onTopAttemptInput(e) {
    this.setData({
      topOnAttemptString: e.detail.value
    })
  },

  async onUpdateRoute() {
    const { attemptsMadeString, zoneOnAttemptString, topOnAttemptString, selectedRouteIndex, routes, session_id, score, translations } = this.data

    if (!attemptsMadeString || !zoneOnAttemptString || !topOnAttemptString) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }
    this.setData({updateLoading: true})
    const { event_id } = getApp().globalData
    const attemptsMade = parseInt(attemptsMadeString)
    const zoneOnAttempt = parseInt(zoneOnAttemptString)
    const topOnAttempt = parseInt(topOnAttemptString)
    const routeResult = 'A' + attemptsMade + ' Z' + zoneOnAttempt + ' T' + topOnAttempt

    // update routes array
    routes[selectedRouteIndex].attemptsMade = attemptsMade
    routes[selectedRouteIndex].zoneOnAttempt = zoneOnAttempt
    routes[selectedRouteIndex].topOnAttempt = topOnAttempt
    routes[selectedRouteIndex].climberDNS = false
    routes[selectedRouteIndex].routeResult = routeResult

    // update to the cloud
    const updateRouteData = {
      attemptsMade,
      zoneOnAttempt,
      topOnAttempt,
      routeResult,
      climberDNS: false,
      undoStack: []
    }

    const updateRouteScoreResult = await wx.cloud.callFunction({
      name: 'update-route-score',
      data: {
        updateRouteData,
        routeName: routes[selectedRouteIndex].routeName,
        event_id,
        session_id,
        climberNumber: score.climberNumber
      }
    })

    console.log("updateRouteScoreResult")
    console.log(updateRouteScoreResult.result)

    const { incTotalAttemptsToZone, incTotalAttemptsToTop, incTotalZones, incTotalTops } = updateRouteScoreResult.result

    score.total_attempts_to_zone += incTotalAttemptsToZone
    score.total_attempts_to_top += incTotalAttemptsToTop
    score.total_zones += incTotalZones
    score.total_tops += incTotalTops

    this.setData({
      updateLoading: false,
      routes,
      showRouteScore: false,
      score
    })

  },

  onLoad(options) {
    const eventChannel = this.getOpenerEventChannel()
    const { language } = getApp().globalData
    eventChannel.on('loadScore', data => {
      const { selectedScore, session_id } = data
      
      const routes = selectedScore.routes 
      ? Object.keys(selectedScore.routes)
        .sort((a, b) => selectedScore.routes[a].routeIndex - selectedScore.routes[b].routeIndex)
        .map(routeName => ({
          routeName,
          ...selectedScore.routes[routeName],
        })) 
      : []

      const translations = require(`./${language}.js`)

      this.setData({
        score: selectedScore,
        session_id,
        routes,
        translations
      })
    })
  }
})