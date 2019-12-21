/**
 * @file common utils
 * @author atom-yang
 */

function camelCaseToUnderScore(str = '') {
  return str.replace(/(.)([A-Z])/g, (_, p0, p1) => `${p0}_${p1.toLowerCase()}`);
}

function isObject(value) {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

function parseOrder(options = {}) {
  let { order = 'DESC' } = options;
  order = (order || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  return {
    ...options,
    order
  };
}


module.exports = {
  camelCaseToUnderScore,
  isObject,
  parseOrder
};
