function replaceSymbols(str) {
  return str.replace(/\W/gi, '-');
}

function addExtension(fileName, extension) {
  return `${fileName}.${extension}`;
}

function extractHostWithPath(url) {
  const { host, pathname } = new URL(url);
  return `${host}${pathname}`;
}

function createFileName(fileName, extension) {
  const strWithoutSymbols = replaceSymbols(fileName);
  return addExtension(strWithoutSymbols, extension);
}

/**
 * Make file name for saving page url
 * @param {string} url url of saving page
 * @returns {string} file name
 */
export default function urlToFileName(url) {
  const hostWithPath = extractHostWithPath(url);
  return createFileName(hostWithPath, 'html');
}
