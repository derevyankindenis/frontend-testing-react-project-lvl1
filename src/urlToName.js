import isAbsoluteURL from './isAbsoluteURL';

function isNotSlash(char) {
  return char !== '/';
}

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
  return url;
}

function removeSlashes(url) {
  const startIndex = [...url].findIndex(isNotSlash);
  const endIndex = url.length - [...url].reverse().findIndex(isNotSlash);
  return url.slice(startIndex, endIndex);
}

/**
 * Make file name for saving page url
 * @param {string} url - url of saving page
 * @returns {string} - valid file name
 */
export default function urlToName(url) {
  const hostWithPath = extractHostWithPath(removeSlashes(url));
  return replaceSymbols(hostWithPath);
}
