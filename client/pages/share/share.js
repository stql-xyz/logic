// client/pages/share/share.js
import { getWxml, getStyle } from './canvas';
import COMFUN from '../../utils/comfun';
Page({

  data: {
    content: '',
    tempFilePath: '',
  },

  extraImage() {
    this.widget.canvasToTempFilePath().then(({ tempFilePath }) => {
      this.setData({ tempFilePath });
    });
  },

  async renderToCanvas(type, logic_id) {
    try {
      const db = wx.cloud.database();
      const { data = {} } = await db.collection(type).doc(logic_id).field({ content: true }).get();
      this.setData({ content: data.content });
      const page = 'pages/home/home';
      const cloud_res = await wx.cloud.callFunction({ name: 'logic', data: { $url: 'get_qrcode', page, type, logic_id } });
      console.log(cloud_res);
    } catch (error) {
      COMFUN.showErr({ error, type: 'render_to_canvas' });
    }
    const wxml = getWxml();
    const style = getStyle();
    setTimeout(() => {
      this.widget.renderToCanvas({ wxml, style })
    }, 500); // 一般500ms
  },

  widget: null,
  start_time: 0,
  onLoad({ type, logic_id }) {
    this.widget = this.selectComponent('.widget');
    this.start_time = new Date().valueOf();
    this.renderToCanvas(type, logic_id);
  },

  onReady: function () {

  },

  onShow: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
})