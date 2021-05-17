// client/pages/star/star.js
const APP = getApp();
const AppGlobalData = APP.globalData;
Page({
  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
    /** 点击折叠、顶部导航栏 */
    logic_data: [],
  },
  getData() {

  },
  onLoad: function (options) {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
    this.getData();
  },
})