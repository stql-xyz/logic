const APP = getApp();
const AppGlobalData = getApp().globalData;
Page({
  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
  },
  onLoad(options) {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
  },
  onShow() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
  },

});
