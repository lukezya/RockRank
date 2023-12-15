import Toast from '@vant/weapp/toast/toast';
import XLSX from '../../../utils/xlsx.mini.js'

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
    order: '',
    creationLoading: false
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onGroupSelect(e) {
    console.log("Group Id:")
    console.log(e.detail)
    const groupId = e.detail
    const { scores, groups } = this.data

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

  onDownloadScores() {
    const { groupId, discipline, filteredScores, session_id, formattedGroups, translations } = this.data
    const currentGroup = formattedGroups.find(group => group.value === groupId)
    
    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      [currentGroup.text],
      [discipline], 
      [],
      [translations.ranking, translations.climber_number, translations.climber_name, 'T', 'Z', 'AT', 'AZ', translations.total_attempts, translations.route_results],
      ...filteredScores.map((score, index) => [
        index + 1,
        score.climberNumber,
        score.climberName,
        score.total_tops,
        score.total_zones,
        score.total_attempts_to_top,
        score.total_attempts_to_zone,
        score.total_attempts,
        (score.routes ? Object.keys(score.routes)
          .map(routeName => `${routeName}: ${score.routes[routeName].routeResult}`)
          .join(', ') : '')
      ]),
    ]);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Convert the workbook to a data URI
    const dataURI = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'base64' });

    // Save the data URI to a file
    const fileName = `${wx.env.USER_DATA_PATH}/${currentGroup.text + ' ' + discipline + ' - ' + session_id + ' ' + translations.scores + '.xlsx'}`
    wx.getFileSystemManager().writeFile({
      filePath: fileName,
      data: dataURI,
      encoding: 'base64',
      success: function (res) {
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

  onOrderChange(e) {
    this.setData({
      order: e.detail
    })
  },

  async onCreateGroup() {
    const { round, quota, order, category, discipline, filteredScores, translations } = this.data
    
    if (!round || !quota || !order) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    this.setData({ creationLoading: true })
    const { event_id } = getApp().globalData
    const quotaNumber = parseInt(quota)
    const climbers = order === 'FIRST_RANK_LAST' 
      ? filteredScores.slice(0, quotaNumber).map(score => ({
          climberNumber: score.climberNumber,
          climberName: score.climberName,
        })).reverse()
      : filteredScores.slice(0, quotaNumber).map(score => ({
          climberNumber: score.climberNumber,
          climberName: score.climberName,
        }));

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
      quota: '',
      order: ''
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
    const { session_id } = this.data
    const { event_id } = getApp().globalData;

    wx.cloud.callFunction({ name: 'get-session-scores', data: { event_id, session_id } })
      .then(getSessionScoresResult => {
        console.log("getSessionScoresResult");
        console.log(getSessionScoresResult);

        const { scores } = getSessionScoresResult.result;
        const sortedScores = this.sortResults(scores);

        this.setData({
          scores,
          filteredScores: sortedScores,
        })
      })
  }
})