export const getWxml = () => `
<view class="container" >
  <view class="item-box red">
  </view>
  <view class="item-box green" >
    <text class="text">我是好人!</text>
  </view>
  <view class="item-box blue">
    <text class="text">3333!</text>
  </view>
</view>
`

export const getStyle = () => ({
  container: {
    width: 300,
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  itemBox: {
    width: 80,
    height: 60,
  },
  red: {
    backgroundColor: '#ff0000'
  },
  green: {
    backgroundColor: '#00ff00'
  },
  blue: {
    backgroundColor: '#0000ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    width: 80,
    height: 60,
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  img: {
    width: 40,
    height: 40,
    borderRadius: 20,
  }
});
