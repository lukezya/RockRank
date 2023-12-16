import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * Page initial data
   */
  data: {
    languages: [{ text: '中文', value: 'zh' }, { text: 'English', value: 'en' }],
    icon: {
      unchecked: '/icons/radio-item.svg',
      checked: '/icons/checked-radio.svg',
    },
    showPasswordPrompt: false,
    showScorePopup: false,
    scorePassword: '',
    password: '',
    focusPassword: false,
    focusScorePassword: false,
  },

  onScoringClick() {
    this.setData({
      showScorePopup: true
    })
  },

  onEventControlClick() {
    this.setData({
      showPasswordPrompt: true
    })
  },

  onScorePopupIgnore() {
    this.setData({
      showScorePopup: false,
      scorePassword: ''
    })
  },

  onScorePopupShow() {
    this.setData({
      focusScorePassword: true,
    })
  },

  onScorePasswordInput(e) {
    this.setData({
      scorePassword: e.detail.value
    })
  },

  onConfirmScorePassword() {
    const { scorePassword, translations } = this.data
    if (scorePassword === '8864') {
      wx.navigateTo({
        url: '/pages/events/index'
      })
    } else {
      this.onScorePopupIgnore()
      Toast.fail({
        message: translations.wrong_password,
        selector: '#toasted'
      });
      return
    }
  },

  onPopupIgnore() {
    this.setData({
      showPasswordPrompt: false,
      password: ''
    })
  },

  onPopupShow() {
    this.setData({
      focusPassword: true,
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  onConfirmPassword() {
    const { password, translations } = this.data
    if (password === '5178') {
      wx.navigateTo({
        url: '/pages/admin/add-event/index',
      })
    } else {
      this.onPopupIgnore()
      Toast.fail({
        message: translations.wrong_password,
        selector: '#toasted'
      });
    }
  },

  onLanguageChange(e) {
    const { language } = e.currentTarget.dataset
    getApp().globalData.language = language

    wx.setStorageSync('language', language);
    const translations = require(`./${language}.js`)

    this.setData({
      language,
      translations
    })
  },

  onLoad(options) {
    const language = wx.getStorageSync('language') || 'zh'
    getApp().globalData.language = language

    const translations = require(`./${language}.js`)

    this.setData({ translations, language })
  }
})