// client/pages/prize/prize.js
import COMFUN from '../../utils/comfun';
const APP = getApp();
const AppGlobalData = getApp().globalData;
const first = 'cloud://prod-1gzmtko853faa178.7072-prod-1gzmtko853faa178-1306118681/sys/first.png';
const second = 'cloud://prod-1gzmtko853faa178.7072-prod-1gzmtko853faa178-1306118681/sys/second.png';
const third = 'cloud://prod-1gzmtko853faa178.7072-prod-1gzmtko853faa178-1306118681/sys/third.png';
Page({
  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
    ranking_list: [],
    inviters: '',
    index: '',
    rank_pic: [first, second, third],
  },
  async getData() {
    try {
      const cloud_res = await wx.cloud.callFunction({ name: 'user', data: {
        $url: "get_user_prize",
      }});
      COMFUN.result(cloud_res).success(({ list, inviters, index }) => {
        this.setData({ ranking_list: list, inviters, index });
      });
    } catch (error) {
      COMFUN.showErr({ error, type: 'get_user_prize' });
    }
  },
  onLoad() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
    this.getData();
  },
  onShow() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setNavBar();
  },
});
