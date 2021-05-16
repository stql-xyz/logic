// client/pages/detail/detail.js
import COMFUN from '../../utils/comfun';
const APP = getApp();
const AppGlobalData = getApp().globalData;
Page({

  data: {
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
  /** 控制参考方案显示 */
  findAnswer() {
    const { show_answer } = this.data;
    this.setData({ show_answer: !show_answer });
  },
  /** 点赞 */
  is_liking: false,
  async handleIsLike() {
    try {
      const { logic } = this.data;
      if (!logic || this.is_liking) return;
      this.is_liking = true;
      wx.showLoading({ title: '处理中...' });
      const db = wx.cloud.database();
      const logic_id = logic._id;
      COMFUN.vibrate();
      if (logic.is_like) {
        await db.collection('user_like').where({ logic_id }).remove();
        logic.is_like = false;
        logic.like_num = (logic.like_num || 1) - 1;
        wx.hideLoading();
        wx.showToast({ title: '已取消点赞' });
      } else {
        await db.collection('user_like').add({ data: { logic_id, create_time: db.serverDate() }});
        logic.is_like = true;
        logic.like_num = (logic.like_num || 0) + 1;
        wx.hideLoading();
        wx.showToast({ title: '已赞' });
      }
      this.setData({ logic });
    } catch (error) {
      wx.hideLoading();
      COMFUN.showErr({ error, type: 'set_is_like' });
    }
    this.is_liking = false;
  },
  /** 收藏 */
  is_staring: false,
  async handleIsStar() {
    try {
      const { logic } = this.data;
      if (!logic || this.is_staring) return;
      this.is_staring = true;
      wx.showLoading({ title: '处理中...' });
      const db = wx.cloud.database();
      const logic_id = logic._id;
      if (logic.is_star) {
        await db.collection('user_star').where({ logic_id }).remove();
        logic.is_star = false;
        wx.hideLoading();
        wx.showToast({ title: '已取消收藏' });
      } else {
        await db.collection('user_star').add({ data: { logic_id, create_time: db.serverDate() }});
        logic.is_star = true;
        wx.hideLoading();
        wx.showToast({ title: '已收藏' });
      }
      this.setData({ logic });
    } catch (error) {
      wx.hideLoading();
      COMFUN.showErr({ error, type: 'set_is_star' });
    }
    this.is_staring = false;
  },
  /** 题目跳转 */
  nextLogic () {
    const { index } = this.data.logic;
    this.jumpLogic(index + 1);
    COMFUN.vibrate();
  },
  logic_cache: {},
  async jumpLogic(index) {
    index = Number(index);
    if (this.data.btn_loading) return;
    const { logic: old_logic } = this.data;
    /** 缓存、 来不及保存star, like, 也会缓存 */
    old_logic && (this.logic_cache[old_logic.index] = old_logic);
    if (this.logic_cache[index]) {
      this.setData({ logic: this.logic_cache[index] });
      this.doWithTitle();
      return;
    }
    const db = wx.cloud.database();
    try {
      (index > old_logic.index) && this.setData({ btn_loading: true });
      const { type } = this.data;
      const { data: [logic] } = await db.collection(type).where({ index }).limit(1).get();
      if (!logic) {
        if (index < old_logic.index) {
          COMFUN.showErrModal({ content: '前面没有题目了' });
        } else {
          COMFUN.showErrModal({ content: '已看完全部题目' });
        }
        this.setData({ btn_loading: false });
        return;
      }
      this.setData({ logic, btn_loading: false });
      this.doWithStarLike();
      this.doWithTitle();
    } catch (error) {
      COMFUN.showErr({ error, type: 'jump_logic' });
    }
  },
  doWithTitle () {
    /** 处理已阅读、标题 */
    const { logic, type } = this.data;
    wx.setNavigationBarTitle({ title: `第${logic.index}题: ${logic.title}` });
    wx.setStorage({ data: logic._id, key: type });
    const logic_read = APP.setLogicRead(type, logic._id);
    this.setData({ logic_read });
  },
  async doWithStarLike() {
    /** 获取是否喜欢、收藏 */
    const { logic } = this.data;
    const db = wx.cloud.database();
    try {
      const cloud_res = await wx.cloud.callFunction({ name: 'logic', data: { $url: 'get_logic_like', logic_id: logic._id }});
      COMFUN.result(cloud_res).success(({ like_num, is_like }) => {
        logic.like_num = like_num;
        logic.is_like = is_like;
        logic._id === this.data.logic._id && this.setData({ logic });
      });
      const { total: star_total  } = await db.collection('user_like').where({ logic_id: logic._id }).count();
      logic.is_star = (star_total > 0);
      logic._id === this.data.logic._id && this.setData({ logic });
    } catch (error) {
      COMFUN.showErr({ error, type: 'get_logic_like_star' });
    }
  },
  /** 页面滚动取消底部导航栏选择 */
  handleTouchPage() {
    if (this.data.bottom_bar) {
      COMFUN.vibrate();
      this.setData({ bottom_bar: '' });
    }
  },
  /** ------------底部处理------------- */
  /** 底部导航栏点击 */
  handleBottomBar(event) {
    const { id } = event.target;
    if (!id) return;
    COMFUN.vibrate();
    if (id === 'star') {
      this.handleIsStar();
      this.setData({ bottom_bar: '' });
    } else if (id === 'left') {
      const { index } = this.data.logic;
      this.jumpLogic(index - 1);
      this.setData({ bottom_bar: '' });
    } else {
      const bottom_bar = this.data.bottom_bar === id ? '' : id;
      this.setData({ bottom_bar });
    }
  },
  /** 切换列表 */
  handleLogicList(event) {
    const { id } = event.target
    if (!id) return;
    COMFUN.vibrate();
    this.jumpLogic(id);
    this.setData({ bottom_bar: '' });
  },
  /** 选择主题色 */
  handleThemeIndex(event) {
    const { idx: theme_index } = event.target.dataset;
    if (typeof theme_index !== 'number') return;
    COMFUN.vibrate();
    this.setData({ theme_index });
    wx.setStorageSync('theme_index', theme_index);
    AppGlobalData.theme_index = theme_index;
    APP.setNavBar();
  },
  /** 请求数据 */
  async getData(index) {
    try {
      const { type } = this.data;
      await this.jumpLogic(index);
      wx.hideLoading();
      const cloud_res_title = await wx.cloud.callFunction({ name: 'logic', data: { $url: 'get_logic_title', type }});
      COMFUN.result(cloud_res_title).success(({ data }) => {
        this.setData({ logic_title: data });
      });
    } catch (error) {
      COMFUN.showErr({ error, type: 'get_data' });
    }
  },
  /** ------------周期函数------------- */
  onLoad: async function (options) {
    this.setData({ theme_index: APP.getThemeIndex() });
    const { type, logic_id, index } = options;
    this.setData({ type });
    wx.showLoading({ title: '加载中...' });
    if (index) {
      this.getData(index);
    } else {
      let index = 1;
      const new_logic_id = logic_id || wx.getStorageSync(type);
      if (new_logic_id) {
        const db = wx.cloud.database();
        const { data } = await db.collection(type).doc(new_logic_id).field({ index: true }).get();
        index = data.index;
      }
      this.getData(index);
    }
    /** 设置标题与阅读 */
    const { title: logic_topic } = AppGlobalData.category_list.find(item => item.key === type);
    const logic_read = APP.setLogicRead(type);
    this.setData({ logic_topic, logic_read });
    APP.setNavBar();
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

  },
})