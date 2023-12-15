Component({

  /**
   * Component properties
   */
  properties: {
    showMenu: {
      type: Boolean
    },
    menuItem: {
      type: String
    },
    language: {
      type: String,
      value: 'en',
    },
  },

  /**
   * Component initial data
   */
  data: {
    
  },

  /**
   * Component methods
   */
  methods: {
    onMenuClose(e) {
      this.setData({showMenu: false})
    },
    onEventInfoClick(e) {
      wx.switchTab({
        url: '/pages/admin/event-info/index'
      })
      this.setData({showMenu: false})
    },
    onRouteSetsClick(e) {
      wx.switchTab({
        url: '/pages/admin/route-sets/index'
      })
      this.setData({showMenu: false})
    },
    onClimberGroupsClick(e) {
      wx.switchTab({
        url: '/pages/admin/climber-groups/index'
      })
      this.setData({showMenu: false})
    },
    onSessionsClick(e) {
      wx.switchTab({
        url: '/pages/admin/all-sessions/index'
      })
      this.setData({showMenu: false})
    },
    onScoresClick(e) {
      wx.switchTab({
        url: '/pages/admin/completed-sessions/index'
      })
      this.setData({showMenu: false})
    },
  }
})