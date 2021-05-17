// client/pages/home/home.js
import COMFUN from '../../utils/comfun';
const APP = getApp();
const AppGlobalData = APP.globalData;
Page({

  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
    category_list: AppGlobalData.category_list,
  },

  vibrate: COMFUN.vibrate,

  onLoad: function (options) {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setTabBar();
    APP.setNavBar();
  },

  onReady: function () {

  },

  onShow: function () {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setTabBar();
    APP.setNavBar();
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

  },

  onTabItemTap: function () {
    COMFUN.vibrate();
  }
})