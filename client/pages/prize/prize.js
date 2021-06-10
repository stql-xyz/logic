// client/pages/prize/prize.js
import COMFUN from '../../utils/comfun';
Page({

  data: {

  },

  onLoad: async function () {
    /** 获取最近一个月注册用户的数据 */
    try {
      const cloud_res = await wx.cloud.callFunction({ name: 'user', data: {
        $url: "get_user_prize",
      }});
      COMFUN.result(cloud_res).success(({ list, inviter_count, ranking }) => {
        console.log(list, inviter_count, ranking);
      });
    } catch (error) {
      COMFUN.showErr({ error, type: 'get_user_prize' });
    }
  },

  onShow: function () {

  },
})
