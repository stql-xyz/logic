// client/pages/star/star.js
import COMFUN from '../../utils/comfun';

const APP = getApp();
const AppGlobalData = APP.globalData;
const sort_list = [
  { sort_key: 'create_time', sort_value: 1, title: '时间升序' },
  { sort_key: 'create_time', sort_value: -1, title: '时间倒序' },
  { sort_key: 'index', sort_value: 1, title: '题目升序' },
  { sort_key: 'index', sort_value: -1, title: '题目倒序' },
];
const category_list = [
  { title: '全部', type: '' },
  ...AppGlobalData.category_list,
];
Page({
  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
    /** 顶部导航栏展示数据 */
    category_list,
    sort_list,
    /** 筛选与排序 显示文案 */
    drop_category: '全部类别',
    drop_sort: '时间倒序',
    /** 激活下拉框 */
    drop_active: '',
    /** 题目列表 */
    logic_list: [],
    /** 请求数据参数 */
    first: true,
    loading: false,
    wxloading: false,
    down: false,
    query: {
      limit: 20,
      // type: '',
      // sort_key: '',
      // sort_value: '',
    },
  },
  toDetail(event) {
    const { id, type } = event.currentTarget.dataset;
    if (!id || !type) return;
    COMFUN.vibrate();
    const url = `/pages/detail/detail?logic_id=${id}&type=${type}`;
    wx.navigateTo({ url });
  },
  /** 获取数据 */
  async getLogicData() {
    const {
      loading, down, query, logic_list, type,
    } = this.data;
    if (loading || down) return;
    const isShowLoading = (logic_list.length === 0);
    isShowLoading && wx.showLoading({ title: '加载中' });
    !isShowLoading && this.setData({ loading: true });
    try {
      const cloud_res = await wx.cloud.callFunction({
        name: 'logic',
        data: {
          $url: 'get_user_logic', ...query, total: logic_list.length, db_type: type,
        },
      });
      COMFUN.result(cloud_res).success(({ data }) => {
        const n_data = data.map((item) => ({ ...item, create_time: COMFUN.formatDate2Str(item.create_time) }));
        this.setData({
          logic_list: logic_list.concat(n_data),
          first: false,
          down: n_data.length === 0,
        });
      });
    } catch (error) {
      COMFUN.showErr({ type: 'get_star_data', error });
    }
    isShowLoading && wx.hideLoading();
    !isShowLoading && this.setData({ loading: false });
    this.setData({ wxloading: false });
  },
  /** 顶部导航栏点击 */
  handleTitleTap(event) {
    const { id } = event.currentTarget;
    if (!id) return;
    COMFUN.vibrate();
    const { drop_active } = this.data;
    this.setData({ drop_active: id === drop_active ? '' : id });
  },
  handleCategoryTap(event) {
    const { id: type } = event.target;
    if (typeof type !== 'string') return;
    COMFUN.vibrate();
    const { title: drop_category } = this.data.category_list.find((item) => item.type === type);
    if (drop_category === this.data.drop_category) return this.setData({ drop_active: '' });
    const query = { ...this.data.query, type };
    !type && (delete query.type);
    const init_val = {
      drop_active: '', logic_list: [], wxloading: true, down: false, loading: false,
    };
    this.setData({ drop_category, query, ...init_val }, this.getLogicData);
    wx.setStorage({ data: drop_category, key: `drop_category_${this.data.type}` });
  },
  handleSortTap(event) {
    const { id: drop_sort } = event.target;
    if (!drop_sort) return;
    COMFUN.vibrate();
    if (drop_sort === this.data.drop_sort) return this.setData({ drop_active: '' });
    const { sort_key, sort_value } = this.data.sort_list.find((item) => item.title === drop_sort);
    const query = { ...this.data.query, sort_key, sort_value };
    const init_val = {
      drop_active: '', logic_list: [], wxloading: true, down: false, loading: false,
    };
    this.setData({ drop_sort, query, ...init_val }, this.getLogicData);
    wx.setStorage({ data: drop_sort, key: `drop_sort_${this.data.type}` });
  },
  setTitle(type) {
    let title = '';
    type === 'user_read' && (title = '历史记录');
    type === 'user_star' && (title = '我的收藏');
    title && wx.setNavigationBarTitle({ title });
  },
  onLoad({ type }) {
    this.setData({ type, theme_index: APP.getThemeIndex() });
    this.setTitle(type);
    APP.setNavBar();
    const { query } = this.data;
    const drop_category = wx.getStorageSync(`drop_category_${type}`) || '全部';
    const { type: category_type } = category_list.find((item) => item.title === drop_category);
    category_type && (query.type = category_type);
    const drop_sort = wx.getStorageSync(`drop_sort_${type}`) || '时间倒序';
    const { sort_key, sort_value } = sort_list.find((item) => item.title === drop_sort);
    this.setData({ drop_category, drop_sort, query: { ...query, sort_key, sort_value } }, this.getLogicData);
  },
  onShow() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
  },
});
