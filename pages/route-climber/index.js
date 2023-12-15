// pages/route-climber/index.js
Page({

  /**
   * Page initial data
   */
  data: {
    routeIndex: 0,
    searchQuery: "",
    searchedClimbers: [],
    searchFocus: false,
    climberFocus: 'climberRow'+0,
  },

  onReturnHome(e) {
    wx.reLaunch({
      url: '/pages/login/index',
    })
  },

  onRouteChange(e) {
    this.setData({ routeIndex: e.currentTarget.dataset.routeIndex })
  },

  onSearchChange(e) {
    const search = e.detail.value
    const searchQuery = search.toLowerCase()

    if (searchQuery === "") {
      this.onSearchClear()
    } else {
      const searchedClimbers = this.data.climbers.filter((climber) => {
        return climber.climberName.toLowerCase().includes(searchQuery) ||
          climber.climberNumber.includes(searchQuery)
      })

      this.setData({
        searchedClimbers: searchedClimbers,
        searchQuery: search
      })
    }
  },

  onSearchClear(e) {
    this.setData({
      searchedClimbers: climbers,
      searchQuery: '',
    })
  },

  onSearchFocus(e) {
    this.setData({
      searchFocus: true
    })
  },

  onHomeClick() {
    this.setData({
      searchFocus: false
    })
  },

  onClimberSelect(e) {
    const { climberIndex } = e.currentTarget.dataset
    const { searchedClimbers, routes, routeIndex, climbers } = this.data
    const selectedClimber = searchedClimbers[climberIndex]
    const selectedRoute = routes[routeIndex]

    // get progress.routeName, check if there is any previous scores.
    wx.navigateTo({
      url: '/pages/scoring/index',
      events: {
        loadClimber(data) {}
      },
      success: res => {
        res.eventChannel.emit('loadClimber', { 
          selectedClimber,
          selectedRoute
        })
      }
    })
 
    const allIndex = climbers.findIndex(climber => climber.climberNumber === selectedClimber.climberNumber && climber.climberName === selectedClimber.climberName)

    // Delay using a Promise
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Use async/await for better readability
    const handleDelay = async () => {
      await delay(1000); // Adjust the duration as needed
      this.setData({
        searchedClimbers: climbers,
        searchQuery: '',
        searchFocus: false,
        climberFocus: 'climberRow' + allIndex
      })
    };

    handleDelay();
  },

  onUpdateClimberScore(climberNumber, climberName, routeName, attemptsMade, zoneOnAttempt, topOnAttempt, climberDNS) {
    const { climbers } = this.data
    const climberIndex = climbers.findIndex(climber => climber.climberNumber === climberNumber && climber.climberName === climberName)

    climbers[climberIndex].progress[routeName] = {
      attemptsMade,
      zoneOnAttempt,
      topOnAttempt,
      climberDNS
    }

    this.setData({
      climbers,
      searchedClimbers: climbers
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const { event_id, session_id, language } = getApp().globalData

    wx.cloud.callFunction({
      name: 'get-routes-climbers',
      data:{
        event_id,
        session_id
      }
    }).then(getRoutesClimbersResult => {
      console.log("Get Routes and Climbers:")
      console.log(getRoutesClimbersResult)
  
      const { routes, climbers } = getRoutesClimbersResult.result
      const translations = require(`./${language}.js`)

      climbers.forEach(climber => {
        climber.progress = {}
      })
      
      this.setData({
        routes,
        climbers,
        searchedClimbers: climbers,
        translations
      })
    })
  },
})