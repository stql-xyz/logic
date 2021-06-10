// client/pages/my/my.js
import COMFUN from '../../utils/comfun';

const APP = getApp();
const AppGlobalData = APP.globalData;
Page({

  data: {
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
  },

  async updateUser() {
		COMFUN.vibrate();
		let userProfile = '';
		try {
			const { userInfo } = await COMFUN.wxPromise(wx.getUserProfile)({ desc: '用户头像展示' });
			userProfile = userInfo;
		} catch (error) {
			console.log(error);
		}
		if (!userProfile) return;
		wx.showLoading();
		try {
			const cloud_res = await wx.cloud.callFunction({
				name: 'user',
				data: { $url: 'ser_user_info', userInfo: userProfile },
			});
			COMFUN.result(cloud_res).success(() => {
				wx.navigateTo({ url: '/pages/prize/prize' });
      });
		} catch (error) {
			COMFUN.showErr({ type: 'ser_user_info', error });
		}
		wx.hideLoading();
	},

  onLoad() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setTabBar();
    APP.setNavBar();
  },

  onShow() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setTabBar();
    APP.setNavBar();
  },

  onTabItemTap() {
    COMFUN.vibrate();
  },
});
