// client/pages/detail/detail.js
Page({

  data: {
    title: '两条路',
    like: 0,
    support: 0,
    logic_content: `&emsp;&emsp;你正在去远方村庄的路上。你来到了一个叉路口，有一对双胞胎姐妹站在那里。其中一个总是说真话，而另外一个总是说假话。
    &emsp;&emsp;如果你只允许向其中一个问一条问题，你要怎样问才可以找到去村庄的正确道路呢？`,
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '两条路',
    });
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

  }
})