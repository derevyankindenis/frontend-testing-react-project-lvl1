function replaceSymbols(str) {
  return str.replace(/\W/gi, '-');
}

function extractHostWithPath(url) {
  const { host, pathname } = new URL(url);
  return `${host}${pathname}`;
}

/**
 * Make file name for saving page url
 * @param {string} url url of saving page
 * @returns {string} file name
 */
export default function urlToName(url) {
  const hostWithPath = extractHostWithPath(url);
  return replaceSymbols(hostWithPath);
}
