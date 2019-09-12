/**
 * @file packet middleware
 * @author atom-yang
 */
module.exports = () => {
  return async (ctx, next) => {
    await next();
  };
};
