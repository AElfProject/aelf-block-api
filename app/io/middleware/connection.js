/**
 * @file connection middleware
 * @author atom-yang
 */
module.exports = () => {
  return async (ctx, next) => {
    ctx.socket.emit('connection', 'success');
    await next();
  };
};
