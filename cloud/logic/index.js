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
  // const { OPENID } = cloud.getWXContext()
  // app.router('get_qrcode', async (ctx) => {
  //   const { page, type, logic_id } = event;
  //   try {
  //     const page_url = `${page}?type=${type}&logic_id=${logic_id}`;
  //     const scene = `oid=${OPENID}`;
  //     console.log(page_url, scene);
  //     const { buffer } = await cloud.openapi.wxacode.getUnlimited({ page: page_url, scene, autoColor: true, isHyaline: true });
  //     const { fileID } = await cloud.uploadFile({ cloudPath: `qrcode/${logic_id}.png`, fileContent: buffer });
  //     ctx.body = { ok: true, data: fileID };
  //   } catch (error) {
  //     log.error({ name: 'get_logic_title', error });
	// 		ctx.body = { ok: false };
  //   }
  // });
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