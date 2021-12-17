import isAbsoluteURL from './isAbsoluteURL';

function extractExtension(url) {
  return url.split('.')[0];
}

function replaceSymbols(str) {
  return str.replace(/\W/gi, '-');
}

function extractHostWithPath(url) {
  if (isAbsoluteURL(url)) {
    const { host, pathname } = new URL(url);
    return `${host}${extractExtension(pathname)}`;
  }
  return url[0] === '/' ? url.slice(1) : url;
}

/**
 * Make file name for saving page url
 * @param {string} url - url of saving page
 * @returns {string} - valid file name
 */
export default function urlToName(url) {
  const hostWithPath = extractHostWithPath(url);
  return replaceSymbols(hostWithPath);
}
