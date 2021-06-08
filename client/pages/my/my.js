// client/pages/my/my.js
import COMFUN from '../../utils/comfun';

const APP = getApp();
const AppGlobalData = APP.globalData;
Page({

  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
  },

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

  onPullDownRefresh() {

  },

  onTabItemTap() {
    COMFUN.vibrate();
  },
});
