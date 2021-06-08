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

  onLoad() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setTabBar();
    APP.setNavBar();
  },

  onReady() {

  },

  onShow() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setTabBar();
    APP.setNavBar();
  },

  onHide() {

  },

  onUnload() {

  },

  onPullDownRefresh() {

  },

  onReachBottom() {

  },

  onShareAppMessage() {

  },

  onTabItemTap() {
    COMFUN.vibrate();
  },
});
