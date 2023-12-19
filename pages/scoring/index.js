const Actions = {
  DNS: 'DNS',
  ATTEMPT: 'ATTEMPT',
  ZONE: 'ZONE',
  ZONE_ON_ZERO: 'ZONE_ON_ZERO',
  TOP: 'TOP',
  TOP_AND_ZONE: 'TOP_AND_ZONE',
  TOP_ON_ZERO: 'TOP_ON_ZERO',
};

Page({

  data: {
    routeUnchanged: true
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onConfirmScoreClick(e) {
    const { climberNumber, climberName, routeName, attemptsMade, zoneOnAttempt, topOnAttempt, climberDNS, undoStack } = this.data
    const { event_id, session_id } = getApp().globalData

    wx.cloud.callFunction({
      name: 'update-session-score',
      data: {
        event_id,
        session_id,
        climberNumber,
        routeName,
        attemptsMade,
        zoneOnAttempt,
        topOnAttempt,
        climberDNS,
        undoStack
      }
    }).then(res => {
      console.log(res.result)
    })

    wx.navigateBack({
      delta: 1,
      success: function () {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 1];
        prevPage.onUpdateClimberScore(climberNumber, climberName, routeName, attemptsMade, zoneOnAttempt, topOnAttempt, climberDNS, undoStack)
      },
    });
  },

  onDNSClick(e) {
    this.data.undoStack.push(Actions.DNS)
    this.setData({
      climberDNS: true,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },

  onUndoClick(e) {
    const lastAction = this.data.undoStack.pop()

    switch (lastAction) {
      case Actions.DNS:
        this.undoDNSClick();
        break;
      case Actions.ATTEMPT:
        this.undoAttemptClick();
        break;
      case Actions.ZONE:
        this.undoZoneClick();
        break;
      case Actions.ZONE_ON_ZERO:
        this.undoZoneOnZeroClick();
        break;
      case Actions.TOP:
        this.undoTopClick();
        break;
      case Actions.TOP_AND_ZONE:
        this.undoTopAndZoneClick();
        break;
      case Actions.TOP_ON_ZERO:
        this.undoTopOnZeroClick();
        break;
    }
  },

  onAttemptClick(e) {
    this.data.undoStack.push(Actions.ATTEMPT)
    wx.vibrateShort({
      type: 'light'
    })
    this.setData({
      attemptsMade: this.data.attemptsMade + 1,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },

  onZoneClick(e) {
    const { attemptsMade, undoStack } = this.data
    wx.vibrateShort({
      type: 'medium'
    })

    if (attemptsMade === 0) {
      undoStack.push(Actions.ZONE_ON_ZERO)
      this.setData({
        attemptsMade: 1,
        zoneOnAttempt: 1,
        zoneSuccess: true,
        undoStack: undoStack,
        routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
      })
    } else {
      undoStack.push(Actions.ZONE)
      this.setData({
        zoneOnAttempt: attemptsMade,
        zoneSuccess: true,
        undoStack: undoStack,
        routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
      })
    }
  },

  onTopClick(e) {
    const { attemptsMade, zoneOnAttempt, undoStack } = this.data
    wx.vibrateShort({
      type: 'heavy'
    })
    if (attemptsMade === 0) {
      undoStack.push(Actions.TOP_ON_ZERO)
      this.setData({
        attemptsMade: 1,
        zoneOnAttempt: 1,
        topOnAttempt: 1,
        topSuccess: true,
        undoStack: undoStack,
        routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
      })
    } else if (zoneOnAttempt === 0) {
      undoStack.push(Actions.TOP_AND_ZONE)
      this.setData({
        zoneOnAttempt: attemptsMade,
        topOnAttempt: attemptsMade,
        topSuccess: true,
        undoStack: undoStack,
        routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
      })
    } else {
      undoStack.push(Actions.TOP)
      this.setData({
        topOnAttempt: attemptsMade,
        topSuccess: true,
        undoStack: undoStack,
        routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
      })
    }
  },

  undoDNSClick() {
    this.setData({
      climberDNS: false,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },

  undoAttemptClick() {
    this.setData({
      attemptsMade: this.data.attemptsMade - 1,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },

  undoZoneClick() {
    this.setData({
      zoneOnAttempt: 0,
      zoneSuccess: false,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },

  undoZoneOnZeroClick() {
    this.setData({
      attemptsMade: 0,
      zoneOnAttempt: 0,
      zoneSuccess: false,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },

  undoTopClick() {
    this.setData({
      topOnAttempt: 0,
      topSuccess: false,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },

  undoTopAndZoneClick(e) {
    this.setData({
      topOnAttempt: 0,
      zoneOnAttempt: 0,
      topSuccess: false,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },

  undoTopOnZeroClick() {
    this.setData({
      attemptsMade: 0,
      zoneOnAttempt: 0,
      topOnAttempt: 0,
      topSuccess: false,
      undoStack: this.data.undoStack,
      routeUnchanged: this.data.initialStack.toString() === this.data.undoStack.toString()
    })
  },
  
  onLoad(options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('loadClimber', data => {
      const { selectedClimber, selectedRoute } = data
      const { category, climberNumber, climberName, discipline, round } = selectedClimber
      const { routeName, routeType, numberZones } = selectedRoute
      const routeProgress = selectedClimber.progress?.[routeName]

      const { language } = getApp().globalData
      const translations = require(`./${language}.js`)
      if (routeProgress) {
        const { attemptsMade, zoneOnAttempt, topOnAttempt, climberDNS, undoStack } = routeProgress
        const currentUndoStack = undoStack.slice()
        this.setData({
          category,
          climberNumber,
          climberName,
          discipline,
          round,
          routeName,
          routeType,
          numberZones,
          attemptsMade,
          zoneOnAttempt,
          topOnAttempt,
          zoneSuccess: (zoneOnAttempt > 0),
          topSuccess: (topOnAttempt > 0),
          climberDNS,
          undoStack: currentUndoStack,
          initialStack: undoStack,
          translations
        })
      } else {
        this.setData({
          category,
          climberNumber,
          climberName,
          discipline,
          round,
          routeName,
          routeType,
          numberZones,
          attemptsMade: 0,
          zoneOnAttempt: 0,
          topOnAttempt: 0,
          zoneSuccess: false,
          topSuccess: false,
          climberDNS: false,
          undoStack: [],
          initialStack: [],
          translations
        })
      }
    })
  },
})