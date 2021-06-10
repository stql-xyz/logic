// app.js
App({
  onLaunch(option) {
    if (!wx.cloud) {
      /* eslint-disable-next-line no-console */
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'prod-1gzmtko853faa178',
        traceUser: true,
      });
    }
    this.handleScene(option);
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
    const classic = { title: '经典推理', type: 'classic' };
    const story = { title: '推理小故事', type: 'story' };
    // const brain = { title: '脑筋急转弯', type: 'brain' };
    const category_list = [classic, story];
    this.globalData = {
      page_colors,
      theme_colors,
      color_strs,
      bottom_active,
      category_list,
      user: {},
      openid: '',
    };
    const theme_index = wx.getStorageSync('theme_index');
    this.globalData.theme_index = theme_index;

    this.initLogicRead();
  },
  /**
   * 处理场景值
   */
  async handleScene(option) {
    const { oid = '' } = option.query;
    try {
      const db = wx.cloud.database();
      let { data = [] } = await db.collection('user').get();
      if (!data.length) {
        /** user表 _openid唯一索引 */
        await db.collection('user').add({ data: { inviter: oid, create_time: db.serverDate() } });
        const { data: n_data = [] } = await db.collection('user').get();
        data = n_data;
      }
      this.globalData.openid = data[0]._openid;
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.log(error);
    }
  },

  getThemeIndex() {
    const { theme_index } = this.globalData;
    return typeof theme_index === 'number' ? theme_index : 2;
  },

  setTabBar() {
    const theme_index = this.getThemeIndex();
    const { theme_colors, color_strs, bottom_active } = this.globalData;
    wx.setTabBarStyle({
      backgroundColor: theme_colors[theme_index],
      selectedColor: bottom_active[theme_index],
    });
    wx.setTabBarItem({
      index: 0,
      selectedIconPath: `images/home@${color_strs[theme_index]}.png`,
    });
    wx.setTabBarItem({
      index: 1,
      selectedIconPath: `images/my@${color_strs[theme_index]}.png`,
    });
  },
  setNavBar() {
    const theme_index = this.getThemeIndex();
    const { page_colors } = this.globalData;
    const frontColors = ['#000000', '#000000', '#000000', '#ffffff'];
    wx.setNavigationBarColor({
      backgroundColor: page_colors[theme_index],
      frontColor: frontColors[theme_index],
    });
  },

  setLogicRead(type, id) {
    if (!type) return {};
    const key = `${type}_read`;
    const logic_read = wx.getStorageSync(key) || {};
    if (!id) return logic_read;
    logic_read[id] = 1;
    wx.setStorage({ data: logic_read, key }); // 更改阅读历史
    wx.setStorage({ data: id, key: `${type}_current` }); // 更改当前阅读
    return logic_read;
  },

  async initLogicRead() {
    try {
      const { result: { data = [] } } = await wx.cloud.callFunction({ name: 'logic', data: { $url: 'get_user_read' } });
      data.forEach((item) => {
        const { _id, logic_read = [] } = item;
        const key = `${_id}_read`;
        const read_map = wx.getStorageSync(key) || {};
        logic_read.forEach((it) => { read_map[it] = 1; });
        wx.setStorage({ data: read_map, key });
      });
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.log(error);
    }
  },

});
