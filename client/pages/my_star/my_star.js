// client/pages/star/star.js
import COMFUN from '../../utils/comfun';
const APP = getApp();
const AppGlobalData = APP.globalData;
Page({
  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
    /** 点击折叠、顶部导航栏 */
    category_list: AppGlobalData.category_list,
    logic_data: {  },
  },
  async getStarData() {
    // 遍历获取所有题目
    try {
      
    } catch (error) {
      COMFUN.showErr({ type: 'get_star_data', error });
    }
  },
  onLoad: function (options) {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
    this.getStarData();
  },
})