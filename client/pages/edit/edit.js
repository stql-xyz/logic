import COMFUN from '../../utils/comfun';

const APP = getApp();
const AppGlobalData = getApp().globalData;
Page({
  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
    title: '',
    content: '',
    desc: '',
    answer: '',
  },
  async handleSubmit() {
    const {
      title, content, answer, desc,
    } = this.data;
    wx.showLoading({ title: '修改中' });
    try {
      const db = wx.cloud.database();
      await db.collection('logic_edit').add({
        data: {
          title, content, answer, desc,
        },
      });
    } catch (error) {
      COMFUN.showErr({ error, type: 'submit_edit_logic' });
    }
    wx.hideLoading();
    wx.showToast({ title: '修改成功' });
  },
  async getData() {
    wx.showLoading({ title: '加载中' });
    try {
      const { logic_id } = this.data;
      const db = wx.cloud.database();
      const { data: logic } = await db.collection('logic').doc(logic_id).get();
      const { title, content, answer } = logic;
      this.setData({ title, content, answer });
    } catch (error) {
      COMFUN.showErr({ error, type: 'get_edit_data' });
    }
    wx.hideLoading();
  },
  handleChange(event) {
    const { id } = event.target;
    const { value } = event.detail;
    if (!id) return;
    const { answer } = this.data;
    answer[Number(id)] = value;
    this.setData({ answer });
  },
  addAnswer() {
    const { answer = [] } = this.data;
    answer.push('');
    this.setData({ answer });
  },
  onLoad(options) {
    const { logic_id } = options;
    this.setData({ logic_id, theme_index: APP.getThemeIndex() }, this.getData);
    APP.setNavBar();
  },
  onShow() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
  },

});
