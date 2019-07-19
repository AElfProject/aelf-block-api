/**
 * @file isAdmin
 * @author huangzongzhe
 * description: 判断是否为管理员账户
 * TODO: 现在仅判断cookie，后续加入passport模块
 */

module.exports = options => {
  return async function isAdmin(ctx, next) {
    await next();

    const user_id = ctx.cookies.get('user_id');

    if (!user_id) {
      ctx.body = JSON.stringify({
        error: 200001,
        errorMessage: 'no permission'
      });
      return;
    }
  };
};
