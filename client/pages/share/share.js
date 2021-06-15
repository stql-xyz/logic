// client/pages/share/share.js
import getCanvas from './template';
import COMFUN from '../../utils/comfun';
const APP = getApp();
const AppGlobalData = getApp().globalData;
Page({
  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
    content: '',
    title: '',
    tempFilePath: '',
    width: 400,
    height: 300,
  },
  extraImage() {
    this.widget.canvasToTempFilePath().then(({ tempFilePath }) => {
      this.setData({ tempFilePath });
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => {
          wx.showToast({ title: '图片保存成功' });
        },
        fail: () => {
          wx.showToast({ title: '图片保存失败', icon: 'none' });
        },
      });
    });
  },
  async renderToCanvas(logic_id) {
    try {
      const db = wx.cloud.database();
      const { data = {} } = await db.collection('logic').doc(logic_id).field({ content: true, title: true }).get();
      const content_line = data.content.replaceAll('&emsp;', '') .split('\n\n');
      this.setData({ content: content_line, title: data.title });
      // const page = 'pages/detail/detail';
      // const cloud_res = await wx.cloud.callFunction({ name: 'logic', data: { $url: 'get_qrcode', page, logic_id } });
      // COMFUN.result(cloud_res);

      const fileID = 'cloud://prod-1gzmtko853faa178.7072-prod-1gzmtko853faa178-1306118681/qrcode/658e9e5760c222420e8fcb2123518a13.png';
      const cloud_res = { result : { data: fileID } };
      const { tempFilePath } = await COMFUN.wxPromise(wx.cloud.downloadFile)({ fileID: cloud_res.result.data });
      this.setData({ qrcode: tempFilePath });
    } catch (error) {
      COMFUN.showErr({ error, type: 'render_to_canvas' });
    }
    const { qrcode, content, title } = this.data;
    const { wxml, style, width, height } = getCanvas({ qrcode, content, title });
    this.setData({ width, height });
    console.log(wxml, style);
    setTimeout(() => {
      this.widget.renderToCanvas({ wxml, style })
    }, 500); // 一般500ms
  },
  widget: null,
  start_time: 0,
  onLoad({ logic_id }) {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();

    this.widget = this.selectComponent('.widget');
    this.start_time = new Date().valueOf();
    this.renderToCanvas(logic_id);
  },

  onReady: function () {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
  },
})