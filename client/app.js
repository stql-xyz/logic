import COMFUN from './utils/comfun';
//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'prod-1geur3ew58c7bb5b',
        traceUser: true,
      })
    }
    /** 页面背景 */
    const page_light = '#F6F6F6';
    const page_yellow = '#f7f7d9';
    const page_green = '#e9fbef';
    const page_dark = '#000000';
    const page_colors = [page_light, page_yellow, page_green, page_dark];
    /** 主题色 */
    const theme_light = '#ffffff';
    const theme_yellow = '#f1f1b8';
    const theme_green = '#b8f1cc';
    const theme_dark = '#000000';
    const theme_colors = [theme_light, theme_yellow, theme_green, theme_dark];
    /** 底部导航栏文字激活颜色 */
    const bottom_active = ['#10aeff', '#0b0b02', '#020B05', '#ffffff'];
    /** 主题色标志 */
    const color_strs = ['light', 'yellow', 'green', 'dark'];

    /** ---------- 逻辑题目分类  ----------   */
    const short = { title: '短篇推理', type: 'short' };
    const long = { title: '长篇推理', type: 'long' };
    const math = { title: '数学推理', type: 'match' };
    const paradox = { title: '逻辑悖论', type: 'paradox' };
    const category_list = [short, long, math, paradox];
    this.globalData = {
      page_colors,
      theme_colors,
      color_strs,
      bottom_active,
      category_list,
      user: {},
    }
    const theme_index = wx.getStorageSync('theme_index');
    this.globalData.theme_index = theme_index;
  },

  getThemeIndex() {
    const theme_index = this.globalData.theme_index;
    return typeof theme_index === 'number' ? theme_index : 2;
  },

  setTabBar() {
    const theme_index = this.getThemeIndex();
    const { theme_colors, color_strs, bottom_active } = this.globalData;
    wx.setTabBarStyle({ backgroundColor: theme_colors[theme_index], selectedColor: bottom_active[theme_index] });
    wx.setTabBarItem({ index: 0, selectedIconPath: `images/home@${color_strs[theme_index]}.png` });
    wx.setTabBarItem({ index: 1, selectedIconPath: `images/my@${color_strs[theme_index]}.png` });
  },
  setNavBar() {
    const theme_index = this.getThemeIndex();
    const { page_colors } = this.globalData;
    const frontColors = ['#000000', '#000000', '#000000', '#ffffff' ]
    wx.setNavigationBarColor({ backgroundColor: page_colors[theme_index], frontColor: frontColors[theme_index] });
  },

  setLogicRead(type, id) {
    if (!type) return {};
    const key = `${type}_read`;
    const logic_read = wx.getStorageSync(key) || {};
    if (!id) return logic_read;
    logic_read[id] = new Date().valueOf();
    wx.setStorage({ data: logic_read, key }); // 更改阅读历史
    wx.setStorage({ data: id, key: `${type}_current` }); // 更改当前阅读
    return logic_read;
  },

})
