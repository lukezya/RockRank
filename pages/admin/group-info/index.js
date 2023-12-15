import Toast from '@vant/weapp/toast/toast';
import XLSX from '../../../utils/xlsx.mini.js'

Page({

  /**
   * Page initial data
   */
  data: {
    category:'',
    discipline: '',
    round: '',
    showCategoryPopup: false,
    showDisciplinePopup: false,
    climbers: [],
    showAddClimber: false,
    climberNumber: '',
    climberName: '',
    updateLoading: false,
    editMode: false
  },

  onBackClick(e) {
    wx.navigateBack()
  },

  onCategoriesShow(e) {
    this.setData({showCategoryPopup: true})
  },

  onCategoriesClose(e) {
    this.setData({showCategoryPopup: false})
  },

  onCategoriesCancel(e) {
    this.setData({showCategoryPopup: false})
  },

  onCategoryConfirm(e) {
    const selectedCategory = e.detail.value
    this.setData({
      category: selectedCategory,
      showCategoryPopup: false      
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

  onRoundInput(e) {
    this.setData({
      round: e.detail.value
    })
  },

  onDeleteClimber(e) {
    const {groupIndex} = e.currentTarget.dataset
    const {climbers} = this.data
    climbers.splice(groupIndex, 1)

    this.setData({climbers})
  },

  onAddClimberClick(e) {
    this.setData({ showAddClimber: true })
  },

  onAddClimberClose(e) {
    this.setData({ showAddClimber: false })
  },

  onClimberNumberInput(e) {
    this.setData({
      climberNumber: e.detail.value
    })
  },

  onClimberNameInput(e) {
    this.setData({
      climberName: e.detail.value
    })
  },

  onAddClimberAdd(e) {
    const { climbers, climberNumber, climberName, translations } = this.data

    if (!climberNumber || !climberName) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    climbers.push({
      climberNumber: climberNumber,
      climberName: climberName
    })  

    this.setData({
      climbers,
      climberNumber: '',
      climberName: '',
      showAddClimber: false
    })
  },

  onEditClick(e) {
    this.setData({
      editMode: true
    })
  },

  onDownloadClimbers() {
    const { category, discipline, round, climbers, translations } = this.data

    if (!category || !discipline || !round || climbers.length === 0) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      [category + ' ' + discipline],
      [round],
      [],
      [translations.order, translations.climber_number_title, translations.climber_name_title],
      ...climbers.map((climber, index) => [index + 1, climber.climberNumber, climber.climberName]),
    ]);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Convert the workbook to a data URI
    const dataURI = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'base64' });

    // Save the data URI to a file
    const fileName = `${wx.env.USER_DATA_PATH}/${category + ' ' + discipline + ' - ' + round + ' ' + translations.climbers_title + '.xlsx'}`
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

  onRandomizeClimbers() {
    const { climbers } = this.data
    for (let i = climbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [climbers[i], climbers[j]] = [climbers[j], climbers[i]];
    }

    this.setData({
      climbers,
    });
  },

  async onDoneClick(e) {
    const { category, discipline, round, climbers, group_id, translations } = this.data
    if (!category || !discipline || !round) {
      Toast.fail({
        message: translations.all_fields,
        selector: '#toasted'
      });
      return
    }

    this.setData({updateLoading:true})
    const { event_id } = getApp().globalData
    const updateClimberGroupResult = await wx.cloud.callFunction({
      name: 'update-climber-group',
      data: {
        event_id,
        group_id,
        category,
        discipline,
        round,
        climbers
      }
    })

    console.log("Update Climber Group Result:")
    console.log(updateClimberGroupResult.result)
    
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2]
    const { climberGroups, categoryFilter, disciplineFilter } = prevPage.data
    const { updatedIndex } = updateClimberGroupResult.result
    climberGroups[updatedIndex].category = category
    climberGroups[updatedIndex].discipline = discipline
    climberGroups[updatedIndex].round = round
    prevPage.setData({
      climberGroups
    })
    prevPage.onFilterSelect(categoryFilter, disciplineFilter)

    this.setData({
      updateLoading: false,
      editMode: false
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const group_id = decodeURIComponent(options.groupId)
    const { event_id, categories, disciplines, language } = getApp().globalData

    wx.cloud.callFunction({
      name: 'get-group-info',
      data: {
        event_id,
        group_id
      }
    }).then(getGroupInfoResult => {
      const { category, discipline, round, climbers } = getGroupInfoResult.result
      const translations = require(`./${language}.js`)

      this.setData({
        categories,
        disciplines,
        category,
        discipline,
        round,
        climbers,
        group_id,
        translations
      })
    })  
  }
})