/**
 * @file accessFrequencyRestrict
 * @author huangzongzhe
 * description: 访问频率限制
 */

let preTime = (new Date()).getTime();
module.exports = options => {
  return async function accessFrequencyRestrict(ctx, next) {
    await next();
    const nowTime = (new Date()).getTime();

    if (nowTime - options.millisecond < preTime) {
      ctx.body = JSON.stringify({
        error: 200002,
        errorMessage: 'What\'s your problem'
      });
      return;
    }
    preTime = nowTime;
  };
};
