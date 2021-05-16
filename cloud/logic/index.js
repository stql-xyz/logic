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
  const { OPENID } = cloud.getWXContext()
  /** 获取逻辑题目喜欢数量 */
  app.router('get_logic_like', async (ctx) => {
    const { logic_id  } = event;
    try {
      const { total: is_like } = await db.collection('user_like').where({ logic_id, _openid: OPENID }).count();
      const { total: like_num } = await db.collection('user_like').where({ logic_id }).count();
      ctx.body = { ok: true, like_num, is_like: is_like > 0 };
    } catch (error) {
      log.error({ name: 'get_first_logic', error });
			ctx.body = { ok: false };
    }
  });
  /** 访问逻辑题目标题 */
  app.router('get_logic_title', async (ctx) => {
    const { type } = event;
    try {
      const { list = [] } = await db.collection(type)
        .aggregate()
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