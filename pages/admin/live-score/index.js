Page({

  /**
   * Page initial data
   */
  data: {
    groupId: 'All Groups',
    createGroup: false,
    category: '',
    discipline: '',
    round: '',
    sessionScoresRefreshTimer: null,
    startX: 0,
  },

  touchstart(e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
    });
  },

  touchend(e) {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - this.data.startX;

    if (deltaX > 50) {
      wx.navigateBack();
    }
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const session_id = decodeURIComponent(options.sessionId);
    const groupId = decodeURIComponent(options.groupId)
    const { language } = getApp().globalData;
    const translations = require(`./${language}.js`)
  
    this.setData({session_id, translations, groupId})
  },

  sortResults(results) {
      // Define a custom comparator function for sorting
    function compareClimbers(a, b) {
      if (a.total_tops !== b.total_tops) {
        return b.total_tops - a.total_tops; // Sort by most total_tops
      } else if (a.total_zones !== b.total_zones) {
        return b.total_zones - a.total_zones; // If total_tops are equal, sort by most total_zones
      } else if (a.total_attempts_to_top !== b.total_attempts_to_top) {
        return a.total_attempts_to_top - b.total_attempts_to_top; // If total_zones are equal, sort by least attempts to top
      } else {
        return a.total_attempts_to_zone - b.total_attempts_to_zone; // If attempts to top are equal, sort by least attempts to zone
      }
    }

    // Sort the array using the custom comparator
    results.sort(compareClimbers);

    return results;
  },
  
   onShow() {
    this.refreshSessionScores()
    this.data.sessionScoresRefreshTimer = setInterval(() => {
      this.refreshSessionScores()
    }, 10000)
  },

  refreshSessionScores() {
    const { session_id, groupId } = this.data
    const { event_id } = getApp().globalData;

    wx.cloud.callFunction({ name: 'get-session-scores', data: { event_id, session_id } })
    .then(getSessionScoresResult => {
      console.log("getSessionScoresResult");
      console.log(getSessionScoresResult);

      const { scores } = getSessionScoresResult.result;

      const filteredScores = this.sortResults(scores.filter(score => score.group_id === groupId)).map((score) => ({
        ...score,
        score_record: (score.routes ? Object.keys(score.routes)
        .sort((a, b) => score.routes[a].routeIndex - score.routes[b].routeIndex)
        .map(routeName => `${routeName}: ${score.routes[routeName].routeResult}`)
        .join(' | ') : '')
      }))

      const { category, round, discipline } = filteredScores[0]
      const title = category + ' ' + discipline + ' - ' + round

      this.setData({
        filteredScores,
        title
      })
    })
  },

  onHide() {
    clearInterval(this.data.sessionScoresRefreshTimer)
  },

  onUnload() {
    clearInterval(this.data.sessionScoresRefreshTimer)
  }
})