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
    return `${host}${pathname}`;
  }
  const extrExt = extractExtension(url);
  return extrExt[0] === '/' ? extrExt.slice(1) : extrExt;
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
