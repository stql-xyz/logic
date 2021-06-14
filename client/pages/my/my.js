// client/pages/my/my.js
import COMFUN from '../../utils/comfun';

const APP = getApp();
const AppGlobalData = APP.globalData;
Page({

  data: {
		nickname: '',
		avatar_url: '',
    theme_index: 'unknow',
    color_strs: AppGlobalData.color_strs,
	},
	
	async storeUserInfo() {
		try {
			const db = wx.cloud.database();
      let { data = [] } = await db.collection('user').field({ avatar_url: true, nickname: true }).get();
			const [ { nickname, avatar_url } = {} ] = data;
			this.setData({ nickname, avatar_url });
			wx.setStorage({ key: 'nickname', data: nickname });
			wx.setStorage({ key: 'avatar_url', data: avatar_url });
		} catch (error) {
			COMFUN.showErr({ type: 'store_user_info', error });
		}
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
		this.storeUserInfo();
	},

  onLoad() {
    this.setData({ theme_index: APP.getThemeIndex() });
    APP.setTabBar();
		APP.setNavBar();
		const nickname = wx.getStorageSync('nickname');
		const avatar_url = wx.getStorageSync('avatar_url');
		this.setData({ nickname, avatar_url });
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
