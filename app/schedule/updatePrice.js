module.exports = {
  schedule: {
    cron: '*/5 * * * * *',
    type: 'worker',
    immediate: true
  },
  async task(ctx) {
    if (+process.env.ENABLE_PRICE_UPDATE !== 1) {
      return;
    }
    await ctx.service.token.getPrice({
      fsym: 'ELF',
      tsyms: 'USD'
    });
    await ctx.service.token.getPrice({
      fsym: 'ELF',
      tsyms: 'USD,BTC,CNY'
    });
  }
};
