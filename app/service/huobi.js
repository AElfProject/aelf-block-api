/*
 * huangzongzhe
 * 2018.10
 * https: //github.com/huobiapi/API_Docs/wiki/REST_request
 */
const Service = require('egg').Service;

const API_URL = 'https://api.huobi.pro/market';

class HuobiService extends Service {

    async getDetail(options) {
        // 这个接口被墙了，需要翻墙。注意VPN，shadowsocket的区别。

        const ctx = this.ctx;
        const result = await ctx.curl(`${API_URL}/detail?symbol=${options.symbol}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36'
            },
        });
        return result.data;
    }
}

module.exports = HuobiService;