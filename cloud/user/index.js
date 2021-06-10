// 云函数入口文件
const cloud = require('wx-server-sdk');
const TcbRouter = require('tcb-router');
const got = require('got');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database({ throwOnNotFound: false });
const log = cloud.logger();
const $ = db.command.aggregate;
const _ = db.command;

// 云函数入口函数
exports.main = async (event) => {
  const app = new TcbRouter({ event });

  app.router('ser_user_info', async (ctx) => {
    const { OPENID = '' } = cloud.getWXContext();
		try {
			const { userInfo = {} } = event;
			const { avatarUrl, nickName } = userInfo;
			const fileContent = await got(avatarUrl).buffer();
			const { fileID } = await cloud.uploadFile({ cloudPath: `avatar/${OPENID}_${new Date().valueOf()}.jpeg`, fileContent });
			const user = { ...userInfo, avatar_url: fileID, nickname: nickName };
			delete user.avatarUrl;
			delete user.nickName;
			await db.collection('user').where({ _openid: OPENID }).update({ data: { ...user }});
			ctx.body = { ok: true };
		} catch (error) {
			log.error({ name: 'ser_user_info', error });
			ctx.body = { ok: false };
		}
	});

  app.router('get_user_prize', async (ctx) => {
    const { OPENID = '' } = cloud.getWXContext();
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    try {
      const { list = [] } = await db.collection('user')
        .aggregate()
        .match({ inviter: _.neq("") })
        .project({
          _id: true,
          inviter: true,
          c_year: $.year('$create_time'),
          c_month: $.month('$create_time'),
        })
        .match({ c_year: year, c_month: month })
        .group({ _id: '$inviter', num: $.sum(1) })
				.lookup({ from: 'user', localField: '_id', foreignField: '_openid', as: 'userinfo' })
				.addFields({ user_info: $.arrayElemAt(['$userinfo', 0]) })
        .project({ _id: true, num: true, 'userinfo.avatar': true, 'userinfo.nickname': true })
        .group({ _id: '$num', users: $.push('$userinfo') })
        .sort({ _id: -1 })
        .limit(3)
        .end();
      const { list: [ { inviter_count = 0 } = {} ]} = await db.collection('user')
        .aggregate()
        .match({ inviter: OPENID })
        .project({
          c_year: $.year('$create_time'),
          c_month: $.month('$create_time'),
        })
        .match({ c_year: year, c_month: month })
        .count('inviter_count')
        .end();
      const { list : [ { ranking = 0 } = {} ]} = await db.collection('user')
        .aggregate()
        .match({ inviter: _.neq("") })
        .project({
          c_year: $.year('$create_time'),
          c_month: $.month('$create_time'),
        })
        .match({ c_year: year, c_month: month })
        .group({ _id: '$inviter', num: $.sum(1) })
        .match({ num: _.gt(inviter_count.inviter_count) })
        .count('ranking')
        .end();
      ctx.body = { ok: true, list, inviter_count, ranking };
    } catch (error) {
      log.error({ name: 'get_user_prize', error });
			ctx.body = { ok: false };
    }
  });

  return app.serve(); // 必需返回
}
