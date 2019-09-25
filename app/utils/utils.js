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

module.exports = {
  camelCaseToUnderScore,
  isObject
};
