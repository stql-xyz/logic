// client/pages/detail/detail.js
import COMFUN from '../../utils/comfun';

const APP = getApp();
const AppGlobalData = getApp().globalData;
Page({

  data: {
    pageTop: 0,
    type: '',
    /** 配色配置 */
    theme_index: 'unknow',
    page_colors: AppGlobalData.page_colors,
    theme_colors: AppGlobalData.theme_colors,
    color_strs: AppGlobalData.color_strs,

    /** 展示参考答案 */
    show_answer: false,
    /** 底部导航栏 选择值 */
    bottom_bar: '',
    btn_loading: false, /** logic加载中 */
    /** --------- 题目 --------- */
    logic: '',
    /** 题目标题列表 */
    logic_topic: '',
    logic_title: [],
    logic_read: {},
  },
  vibrate: COMFUN.vibrate,
  /** ------------控制答案显示------------ */
  findAnswer() {
    this.vibrate();
    this.setData({ show_answer: !this.data.show_answer });
  },
  /** ------------收藏------------ */
  is_staring: false,
  async handleIsStar() {
    const { logic } = this.data;
    /** 防止重复收藏以及收藏不准确 */
    if (this.is_staring || typeof logic.is_star !== 'boolean') return;
    wx.showLoading({ title: '处理中...' });
    this.is_staring = true;
    let tipStr = '';
    try {
      const db = wx.cloud.database();
      if (logic.is_star) {
        await db.collection('user_star').where({ logic_id: logic._id }).remove();
        logic.is_star = false;
        tipStr = '已取消收藏';
      } else {
        await db.collection('user_star').add({ data: { logic_id: logic._id, create_time: db.serverDate() } });
        logic.is_star = true;
        tipStr = '已收藏';
      }
    } catch (error) {
      COMFUN.showErr({ error, type: 'set_is_star' });
    }
    this.setData({ logic });
    wx.hideLoading();
    this.is_staring = false;
    if (tipStr) wx.showToast({ title: tipStr });
  },
  /** ------------获取页面数据------------ */
  goTop() {
    setTimeout(() => this.setData({ pageTop: 0 }), 0);
  },
  logic_cache: {},
  async getLogicById(logic_id) {
    if (this.data.btn_loading || !logic_id) return {};
    this.setData({ show_answer: false }); // 关闭答案
    const { logic: old_logic } = this.data;
    /** 先保存缓存、来不及保存star, 也会缓存； 有缓存的直接返回 */
    this.logic_cache[old_logic._id] = old_logic;
    if (this.logic_cache[logic_id]) {
      this.setData({ logic: this.logic_cache[logic_id] }, this.goTop);
      return this.dealWithTitle();
    }
    /** 没有缓存请求 */
    const db = wx.cloud.database();
    this.setData({ btn_loading: true });
    try {
      const { data: logic } = await db.collection('logic').doc(logic_id).get();
      this.setData({ logic }, this.setLogicStar);
      this.dealWithTitle();
    } catch (error) {
      COMFUN.showErr({ error, type: 'get_logic_byid' });
    }
    this.setData({ btn_loading: false }, this.goTop);
    return {};
  },
  /** 获取是否喜欢、收藏 */
  async setLogicStar() {
    const { logic } = this.data;
    if (!logic) return;
    const db = wx.cloud.database();
    try {
      const { total: star_total } = await db.collection('user_star').where({ logic_id: logic._id }).count();
      logic.is_star = (star_total > 0);
      if (logic._id === this.data.logic._id) this.setData({ logic }); // 防止迅速跳转
    } catch (error) {
      COMFUN.showErr({ error, type: 'get_logic_star' });
    }
  },
  /** 处理已阅读、标题  */
  dealWithTitle() {
    const { logic, type } = this.data;
    if (!logic) return;
    wx.setNavigationBarTitle({ title: `第${logic.index}题: ${logic.title}` });
    const logic_read = APP.setLogicRead(type, logic._id);
    this.setData({ logic_read });
    // 增加阅读记录
    const db = wx.cloud.database();
    db.collection('user_read').add({ data: { logic_id: logic._id, create_time: db.serverDate() } });
  },
  /** ------------下一题------------ */
  jumpLogic(diff) {
    if (!diff) return;
    const { logic, logic_title } = this.data;
    const index = logic_title.findIndex((item) => item._id === logic._id);
    const result = logic_title[index + diff];
    if (!result) {
      const content = (diff > 0) ? '已看完全部题目' : '前面没有题目了';
      COMFUN.showErrModal({ content });
    } else {
      this.getLogicById(result._id);
    }
  },
  nextLogic() {
    if (this.data.logic_title.length === 0) return;
    this.vibrate();
    this.jumpLogic(1);
  },
  /** ------------底部处理------------- */
  /** 页面滚动取消底部导航栏选择 */
  handleTouchPage() {
    if (!this.data.bottom_bar) return;
    this.vibrate();
    this.setData({ bottom_bar: '' });
  },
  /** 底部导航栏点击 */
  handleBottomBar(event) {
    const { id } = event.target;
    if (!id) return {};
    this.vibrate();
    if (id === 'star') {
      this.handleIsStar();
      return this.setData({ bottom_bar: '' });
    }
    if (id === 'left') {
      this.jumpLogic(-1);
      return this.setData({ bottom_bar: '' });
    }
    const bottom_bar = this.data.bottom_bar === id ? '' : id;
    return this.setData({ bottom_bar });
  },
  /** 切换列表 */
  handleLogicList(event) {
    const { id } = event.target.dataset;
    if (!id) return;
    this.vibrate();
    this.getLogicById(id);
    this.setData({ bottom_bar: '' });
  },
  /** 选择主题色 */
  handleThemeIndex(event) {
    const { idx: theme_index } = event.target.dataset;
    if (typeof theme_index !== 'number') return;
    this.vibrate();
    this.setData({ theme_index });
    wx.setStorage({ data: theme_index, key: 'theme_index' });
    AppGlobalData.theme_index = theme_index;
    APP.setNavBar();
  },
  /** ------------周期函数------------- */
  async onLoad(options) {
    const { type, logic_id } = options;
    this.setData({ theme_index: APP.getThemeIndex(), type });
    wx.showLoading({ title: '加载中...' });
    try {
      // 刚进入页面不用cache
      const db = wx.cloud.database();
      const new_logic_id = logic_id || wx.getStorageSync(`${type}_current`);
      let logic = '';
      if (new_logic_id) {
        try {
          const idLogic = await db.collection('logic').doc(new_logic_id).get();
          logic = idLogic.data;
        } catch (error) {
          /* eslint-disable-next-line no-console */
          console.log(error);
        }
      }
      if (!logic) {
        const typeLogicList = await db.collection('logic').where({ index: 1, type }).get();
        [logic] = typeLogicList.data;
      }
      this.setData({ logic });
      this.setLogicStar();
      this.dealWithTitle();
      wx.hideLoading();
      const cloud_res_title = await wx.cloud.callFunction({ name: 'logic', data: { $url: 'get_logic_title', type } });
      COMFUN.result(cloud_res_title).success(({ data }) => this.setData({ logic_title: data }));
      setTimeout(() => this.setData({ logic }), 100);
    } catch (error) {
      wx.hideLoading();
      COMFUN.showErr({ error, type: 'init_detail' });
    }
    /** 设置标题顶部与是否阅读 */
    const { title: logic_topic } = AppGlobalData.category_list.find((item) => item.type === type);
    const logic_read = APP.setLogicRead(type);
    this.setData({ logic_topic, logic_read });
    APP.setNavBar();
  },
  onShareAppMessage() {
    const { logic, type } = this.data;
    const { openid } = getApp().globalData;
    const { title } = logic;
    const path = `/pages/detail/detail?type=${type}&logic_id=${logic._id}&oid=${openid}`;
    return { title, path };
  },
});
