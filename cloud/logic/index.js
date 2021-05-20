// 云函数入口文件
const cloud = require('wx-server-sdk');
const TcbRouter = require('tcb-router');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database({ throwOnNotFound: false });
const log = cloud.logger();
const $ = db.command.aggregate;
const _ = db.command;

// 云函数入口函数
exports.main = async (event) => {
  const app = new TcbRouter({ event });
  app.router('get_user_logic', async (ctx) => {
    const { OPENID = '' } = cloud.getWXContext()
    const { sort_type, sort_value, limit = 1000, total = 0, type } = event;
    try {
      const { list = [] } = await db.collection('logic_read')
        .aggregate()
        .match({ _openid: OPENID })
        .lookup({ from: 'logic', localField: 'logic_id', foreignField: '_id', as: 'logic' })
				.addFields({ logic: $.arrayElemAt(['$logic', 0]) })
				.addFields({ 'logic.create_time': '$create_time' })
				.replaceRoot({ newRoot: '$logic' })
        .match({ type })
        .sort({ [sort_type]: Number(sort_value) })
        .skip(total)
        .limit(limit)
        .project({ _id: true, create_time: true, title, type })
        .end();
      ctx.body = { ok: true, data: list };
    } catch (error) {
      log.error({ name: 'get_logic_title', error });
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