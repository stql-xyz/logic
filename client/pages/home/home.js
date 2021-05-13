// client/pages/home/home.js
Page({
 
  data: {
    category_list: [
      '逻辑推理题(0/100)',
      '悖论(0/80)',
      '量水问题(0/80)',
      '纵横问题(0/80)'
    ]
  },

  goDetail() {
    const type = 'common';
    const url = `/pages/detail/detail?type=${type}`;
    wx.navigateTo({ url });
  },

  onLoad: function (options) {

  },

  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})