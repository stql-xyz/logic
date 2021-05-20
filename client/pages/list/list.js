// client/pages/star/star.js
import COMFUN from '../../utils/comfun';
const APP = getApp();
const AppGlobalData = APP.globalData;
Page({
  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
    /** 顶部导航栏展示数据 */
    category_list: AppGlobalData.category_list,
    sort_list: [
      { sort_key: 'create_time', sort_value: 1, title: '时间升序' },
      { sort_key: 'create_time', sort_value: -1, title: '时间降序' },
      { sort_key: 'index', sort_value: 1, title: '题目升序' },
      { sort_key: 'index', sort_value: -1, title: '题目降序' },
    ],
    /** 筛选与排序 显示文案 */
    drop_category: '',
    drop_sort: '',
    /** 激活下拉框 */
    drop_active: '',
    /** 题目列表 */
    logic_list: [],
    /** 请求数据参数 */
    first: true,
		loading: false,
		down: false,
    query: {
      limit: 20,
      // type: '',
      // sort_type: '',
      // sort_value: '',
    }
  },
  /** 获取数据 */
  async getLogicData() {
    const { loading, down } = this.data;
    if (loading || down) return;
		const isShowLoading = (notice_list.length === 0);
		isShowLoading && wx.showLoading({ title: '加载中' });
		!isShowLoading && this.setData({ loading: true });
    try {
      const { query, logic_list } = this.data;
      const cloud_res = await wx.cloud.callFunction({
        name: '', 
        data: { $url: 'get_user_logic', ...query, total: logic_list.length },
      });
      COMFUN.result(cloud_res).success(({ data }) => {
        this.setData({
          logic_list: logic_list.concat(data),
					first: false,
					down: data.length === 0,
        })
      });
    } catch (error) {
      COMFUN.showErr({ type: 'get_star_data', error });
    }
    isShowLoading && wx.hideLoading();
		!isShowLoading && this.setData({ loading: false });
  },
  /** 顶部导航栏点击 */
  handleTitleTap(event) {
		const { id } = event.target;
    if (!id) return;
    this.setData({ drop_active: id });
  },
  handleCategoryTap(event) {
    const { id: type } = event.target;
    if (!type) return;
    const { title } = this.data.sort_list.find(item => item.type === type);
    const query = { ...this.data.type, type };
    this.setData({ drop_active: '', query, drop_category: title }, this.getLogicData);
  },
  handleSortTap(event) {
    const { id: drop_sort } = event.target;
    if (!drop_sort) return;
    const { create_time, sort_value } = this.data.sort_list.find(item => item.title === drop_sort);
    const query = { ...this.data.query, create_time, sort_value };
    this.setData({ drop_active: '', query, drop_sort }, this.getLogicData);
  },
  onLoad: function ({ type }) {
    this.setData({ type, theme_index: APP.getThemeIndex() });
    APP.setNavBar();
    this.getStarData();
  },
})