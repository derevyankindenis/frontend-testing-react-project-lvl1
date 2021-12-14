/**
 * Check is absolute url or relative
 * @param {string} url - target url to check
 * @return {boolean}
 */
export default function isAbsoluteURL(url) {
  return url.indexOf('://') > 0 || url.indexOf('//') === 0;
}
