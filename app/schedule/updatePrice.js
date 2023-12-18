module.exports = {
  schedule: {
    cron: '*/5 * * * * *',
    type: 'worker',
    immediate: true
  },
  async task(ctx) {
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
