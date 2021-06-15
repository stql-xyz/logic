export default ({ qrcode, content, title }) => {
  const lineHeight = 25;
  const maxWidth = 375;
  const padding = 15;
  const fontSize = 18;
  const style = {
    container: {
      width: maxWidth,
      height: 0,
      lineHeight,
      fontSize,
      paddingLeft: padding,
      paddingRight: padding,
      backgroundColor: '#FFFFFF',
      // backgroundColor: '#ececec',
    },
    title: {
      height: lineHeight + padding,
      lineHeight: lineHeight + padding,
      width: maxWidth - padding * 2,
      textAlign: 'center',
    },
    image: {
      height: 70,
      width: 70,
    },
    imageWraper: {
      height: 100,
      width: maxWidth - padding * 2,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    tipwrp: {
      width: 200,
      height: 100,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imgtip: {
      width: 200,
      height: lineHeight,
      lineHeight,
    },
  };
  const line_num = Math.floor((maxWidth - padding * 2) / fontSize);
  const text_line = content.map((item, index) => {
    const height = Math.ceil(item.length / line_num) * style.container.lineHeight;
    style.container.height += height;
    console.log(style.container.height);
    style[`text${index}`] = { width: maxWidth - padding * 2, height };
    return `
      <text class="text${index}">
        ${item}
      </text>
    `;
  }).join('\n');
  style.container.height += style.title.height;
  style.container.height += style.imageWraper.height;
  const wxml =  `
    <view class="container">
      <text class="title">${title}</text>
      ${text_line}
      <view class="image-wraper">
        <image class="image" mode="scaleToFill" src="${qrcode}" />
        <view class="tipwrp">
          <text class="imgtip">长按识别二维码查看答案</text>
          <text class="imgtip">及更多经典推理题</text>
        </view>
      </view>
    </view>
  `;
  return { wxml, style, height: style.container.height, width: style.container.width };
};
