// 云函数入口文件
const cloud = require('wx-server-sdk');
const TcbRouter = require('tcb-router');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database({ throwOnNotFound: false });
const log = cloud.logger();
const $ = db.command.aggregate;
const _ = db.command;

// 基于base62编码生成14位的ID字符串
// 优点：短/按时间序/双击可全选/唯一性足够安全
const codeStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
function base62encode(v, n){
  var ret = ""
  for(var i=0;i<n;i++){
    ret = codeStr[v%codeStr.length] + ret
    v = Math.floor(v/codeStr.length)
  }
  return ret
}
function getId() {
  var ret = ''
  var ms = (new Date()).getTime()
  ret += base62encode(ms, 8) // 6923年循环一次
  ret += base62encode(Math.ceil(Math.random() * (62**6)), 6) // 冲突概率为每毫秒568亿分之一
  return ret
}

// 云函数入口函数
exports.main = async (event) => {
  const app = new TcbRouter({ event });

  app.router('get_qrcode', async (ctx) => {
    const { page, logic_id } = event;
    const { OPENID = '' } = cloud.getWXContext();
    try {
      const user_share_id = getId();
      const scene = `share_id=${user_share_id}`;
      db.collection('user_share').add({ data: { _id: user_share_id, _openid: OPENID, logic_id, create_time: db.serverDate() }}).then(() => {});
      const { buffer } = await cloud.openapi.wxacode.getUnlimited({ page, scene, autoColor: true, isHyaline: true });
      const { fileID } = await cloud.uploadFile({ cloudPath: `qrcode/${user_share_id}.png`, fileContent: buffer });
      ctx.body = { ok: true, data: fileID };
    } catch (error) {
      log.error({ name: 'get_qrcode', error });
			ctx.body = { ok: false };
    }
  });

  /**用户已读 */
  app.router('get_user_read', async (ctx) => {
    const { OPENID = '' } = cloud.getWXContext();
    try {
      const { list = [] } = await db.collection('user_read')
        .aggregate()
        .match({ _openid: OPENID })
        .group({ _id: '$logic_id' })
        .project({ _id: true })
        .lookup({ from: 'logic', localField: '_id', foreignField: '_id', as: 'logic' })
				.replaceRoot({ newRoot: $.arrayElemAt(['$logic', 0]) })
        .group({ _id: '$type', logic_read: $.push('$_id') })
        .end();
      ctx.body = { ok: true, data: list };
    } catch (error) {
      log.error({ name: 'get_user_read', error });
			ctx.body = { ok: false };
    }
  });
  /** 用户操作相关列表 */
  app.router('get_user_logic', async (ctx) => {
    const { OPENID = '' } = cloud.getWXContext();
    const { sort_type = 'create_time', sort_value = -1, limit = 1000, total = 0, type, db_type } = event;
    try {
      const { list = [] } = await db.collection(db_type)
        .aggregate()
        .match({ _openid: OPENID })
        .lookup({ from: 'logic', localField: 'logic_id', foreignField: '_id', as: 'logic' })
				.addFields({ logic: $.arrayElemAt(['$logic', 0]) })
        .match({ 'logic.type': type })
        .group({ 
          _id: '$logic._id',
          title: $.first('$logic.title'),
          type: $.first('$logic.type'),
          index: $.first('$logic.index'),
          create_time: $.last('$create_time')
        })
        .sort({ [sort_type]: Number(sort_value) })
        .skip(total)
        .limit(limit)
        .end();
      ctx.body = { ok: true, data: list };
    } catch (error) {
      log.error({ name: 'get_user_logic', error });
			ctx.body = { ok: false };
    }
  });
  /** 访问逻辑题目标题 */
  app.router('get_logic_title', async (ctx) => {
    const { type } = event;
    try {
      const { list = [] } = await db.collection('logic')
        .aggregate()
        .match({ type })
        .sort({ index: 1 })
        .limit(10000)
        .project({ title: true, index: true })
        .end();
      ctx.body = { ok: true, data: list };
    } catch (error) {
      log.error({ name: 'get_logic_title', error });
			ctx.body = { ok: false };
    }
  });
  return app.serve(); // 必需返回
}