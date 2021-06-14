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
    const week = 23;
    try {
      const { list = [] } = await db.collection('user')
        .aggregate()
        .match({ inviter: _.neq("") })
        .project({ _id: true, inviter: true, c_week: $.week('$create_time') })
        .match({ c_week: week })
        .group({ _id: '$inviter', num: $.sum(1) })
				.lookup({ from: 'user', localField: '_id', foreignField: '_openid', as: 'userinfo' })
        .addFields({ user_info: $.arrayElemAt(['$userinfo', 0]) })
        .project({ _id: true, num: true, 'user_info.avatar_url': true, 'user_info.nickname': true })
        .group({ _id: '$num', users: $.push('$user_info') })
        .sort({ _id: -1 })
        .limit(3)
        .end();
      const { list: [ { inviter_count = 0 } = {} ]} = await db.collection('user')
        .aggregate()
        .match({ inviter: OPENID })
        .project({ c_week: $.week('$create_time') })
        .match({ c_week: week })
        .count('inviter_count')
        .end();
      const { list: ranking_list  = [] } = await db.collection('user')
        .aggregate()
        .match({ inviter: _.neq("") })
        .project({ _id: true, inviter: true, c_week: $.week('$create_time') })
        .match({ c_week: week })
        .group({ _id: '$inviter', num: $.sum(1) })
        .group({ _id: -1, ranking: $.push('$num') })
        .end();
      const [ { ranking = [] } = {} ] = ranking_list;
      const filter_ranking = [...new Set(ranking)];
      const index = filter_ranking.findIndex(item => item === inviter_count);
      ctx.body = { ok: true, list, inviters: inviter_count, index };
    } catch (error) {
      log.error({ name: 'get_user_prize', error });
			ctx.body = { ok: false };
    }
  });

  return app.serve(); // 必需返回
}
