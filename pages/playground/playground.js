import XLSX from '../../utils/xlsx.mini.js'

Page({

  /**
   * Page initial data
   */
  data: {
    groupFilter: 'All Groups'
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onGroupSelect(e) {
    console.log("Group Id:")
    console.log(e.detail)
    const groupId = e.detail
    const { scores } = this.data

    const filteredScores = this.sortResults(scores.filter(score => score.group_id === groupId))

    this.setData({
      filteredScores,
      groupFilter: groupId
    })
  },

  onDownloadScores() {
    const { groupFilter, discipline, filteredScores, session_id } = this.data
    const currentGroup = formattedGroups.find(group => group.value === groupFilter)
    
    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      [currentGroup.text],
      [discipline], 
      [],
      ['Ranking', 'Climber Number', 'Climber Name', 'Total Tops', 'Total Zones', 'Total Top Attempts', 'Total Zone Attempts', 'Total Attempts', 'Route Results'],
      ...filteredScores.map((score, index) => [index + 1, score.climberNumber, score.climberName, score.total_tops, score.total_zones, score.total_attempts_to_top, score.total_attempts_to_zone, score.total_attempts, Object.keys(score.routes)
        .map(routeName => `${routeName}: ${score.routes[routeName].routeResult}`)
        .join(', ')]),
    ]);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Convert the workbook to a data URI
    const dataURI = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'base64' });

    // Save the data URI to a file
    const fileName = `${wx.env.USER_DATA_PATH}/${currentGroup.text + ' ' + discipline + ' - ' + session_id + ' Scores.xlsx'}`
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

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const session_id = decodeURIComponent(options.sessionId);
    const discipline = decodeURIComponent(options.sessionDiscipline);
    const { event_id } = getApp().globalData;
  
    Promise.all([
      wx.cloud.callFunction({ name: 'get-session-groups', data: { event_id, session_id } }),
      wx.cloud.callFunction({ name: 'get-session-scores', data: { event_id, session_id } })
    ]).then(([getSessionGroupsResult, getSessionScoresResult]) => {
      console.log("getSessionGroupsResult");
      console.log(getSessionGroupsResult);

      console.log("getSessionScoresResult");
      console.log(getSessionScoresResult);

      const { groups } = getSessionGroupsResult.result;
      const formattedGroups = groups.concat('All Groups').map(group => ({
        text: group.category + ' ' + group.round,
        value: group.group_id
      }));

      const { scores } = getSessionScoresResult.result;
      const sortedScores = this.sortResults(scores);

      this.setData({
        groups,
        formattedGroups,
        scores,
        filteredScores: sortedScores,
        session_id,
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
  }
})