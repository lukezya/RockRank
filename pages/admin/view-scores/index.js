import Toast from '@vant/weapp/toast/toast';
import { decode } from 'base64-arraybuffer'

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
    quota: '',
    creationLoading: false,
    downloadScoresLoading: false,
    sessionScoresRefreshTimer: null,
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onFullScreenClick(e) {
    const { session_id, groupId } = this.data

    wx.navigateTo({
      url: '/pages/admin/live-score/index?sessionId=' + encodeURIComponent(session_id)
        + '&groupId=' + encodeURIComponent(groupId)
    })
  },

  onGroupSelect(e) {
    console.log("Group Id:")
    console.log(e.detail)
    const groupId = e.detail
    const { scores, groups } = this.data

    if (groupId === 'All Groups') {
      this.setData({
        filteredScores: scores,
        groupId
      })
      return
    }

    const currentGroup = groups.find(group => group.group_id === groupId)
    const { category, discipline } = currentGroup

    const filteredScores = this.sortResults(scores.filter(score => score.group_id === groupId))

    this.setData({
      filteredScores,
      groupId,
      category,
      discipline
    })
  },

  onScoreSelect(e) {
    const { scoreIndex } = e.currentTarget.dataset
    const { filteredScores, session_id } = this.data
    const selectedScore = filteredScores[scoreIndex]

    wx.navigateTo({
      url: '/pages/admin/score-info/index',
      events: {
        loadScore(data) {}
      },
      success: res => {
        res.eventChannel.emit('loadScore', { 
          selectedScore,
          session_id
        })
      }
    })
  },

  async onDownloadScores() {
    const { groupId, discipline, filteredScores, groups, translations, session_id } = this.data
    const { event_id } = getApp().globalData
    const currentGroup = groups.find(group => group.group_id === groupId)
    const category = currentGroup ? currentGroup.category : translations.all_groups
    const round = currentGroup ? currentGroup.round : translations.session
    
    this.setData({ downloadScoresLoading: true })
    const excelClimberOrderResult = await wx.cloud.callFunction({
      name: 'excel-group-results',
      data: {
        category,
        discipline,
        round,
        filteredScores,
        event_id,
        session_id
      }
    })

    const fileContent = excelClimberOrderResult.result.fileContent
    const fileContentBuffer = decode(fileContent)

    // Save the data URI to a file
    const fileName = `${wx.env.USER_DATA_PATH}/${category + ' ' + discipline + ' - ' + round + ' 成绩单.xlsx'}`
    wx.getFileSystemManager().writeFile({
      filePath: fileName,
      data: fileContentBuffer,
      encoding: 'binary',
      success: res => {
        this.setData({ downloadScoresLoading: false })
        wx.openDocument({
          filePath: fileName,
          showMenu : true
        })
      }
    });
  },

  onCreateGroupShow() {
    this.setData({
      showCreateGroup: true
    })
  },

  onCreateGroupClose() {
    this.setData({
      showCreateGroup: false
    })
  },

  onRoundInput(e) {
    this.setData({
      round: e.detail.value
    })
  },

  onQuotaInput(e) {
    this.setData({
      quota: e.detail.value
    })
  },

  async onCreateGroup() {
    const { round, quota, category, discipline, filteredScores, translations } = this.data
    
    if (!round || !quota) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    this.setData({ creationLoading: true })
    const { event_id } = getApp().globalData
    const quotaNumber = parseInt(quota)
    const climbers = filteredScores.slice(0, quotaNumber).map(score => ({
      climberNumber: score.climberNumber,
      climberName: score.climberName,
    })).reverse()

    const createGroupResults = await wx.cloud.callFunction({
      name: 'create-climber-group',
      data: {
        category,
        discipline,
        round,
        climbers,
        event_id
      }
    })
    console.log("createGroupResults:")
    console.log(createGroupResults)
    this.setData({
      creationLoading: false,
      showCreateGroup: false,
      round: '',
      quota: ''
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const session_id = decodeURIComponent(options.sessionId);
    const discipline = decodeURIComponent(options.sessionDiscipline);
    const { event_id, language } = getApp().globalData;
    const translations = require(`./${language}.js`)
  
    this.setData({session_id, translations})

    wx.cloud.callFunction({ name: 'get-session-groups', data: { event_id, session_id } })
    .then(getSessionGroupsResult => {
      console.log("getSessionGroupsResult");
      console.log(getSessionGroupsResult);

      const { groups } = getSessionGroupsResult.result;
      const formattedGroups = [{text: translations.all_groups, value: 'All Groups'}].concat(groups.map(group => ({
        text: group.category + ' ' + group.round,
        value: group.group_id
      })));

      this.setData({
        groups,
        formattedGroups,
        discipline
      });
    })
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
    // this.data.sessionScoresRefreshTimer = setInterval(() => {
    //   this.refreshSessionScores()
    // }, 10000)
  },

  refreshSessionScores() {
    const { session_id, groupId } = this.data
    const { event_id } = getApp().globalData;

    wx.cloud.callFunction({ name: 'get-session-scores', data: { event_id, session_id } })
    .then(getSessionScoresResult => {
      console.log("getSessionScoresResult");
      console.log(getSessionScoresResult);

      const { scores } = getSessionScoresResult.result;

      const filteredScores = (groupId === 'All Groups')
        ? this.sortResults(scores)
        : this.sortResults(scores.filter(score => score.group_id === groupId))

      this.setData({
        scores,
        filteredScores,
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