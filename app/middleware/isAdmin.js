/**
 * @file isAdmin
 * @author huangzongzhe
 * description: 判断是否为管理员账户
 * TODO: 现在仅判断cookie，后续加入passport模块
 */

module.exports = options => {
    return async function isAdmin(ctx, next) {
        await next();

        // const aelf0 = ctx.app.mysql.get('aelf0');

        // const checkAdmin = 'select id from users where address=?';
        // const accountAddress = ctx.cookies.get('account', {
        //     signed: false
        // });

        // const isAdmin = await aelf0.query(checkAdmin, [accountAddress]);

        // if (isAdmin.length <= 0) {
        //     ctx.body = JSON.stringify({
        //         error: 200001,
        //         errorMessage: 'no permission'
        //     });
        //     return;
        // }
    };
};
