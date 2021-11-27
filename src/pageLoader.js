/**
 * Load page by url and save to path
 * @param {string} url page location, url
 * @param {string} path path to save page TODO: not required
 * @returns {{filepath: string}} object with path to saved page
 */
export default async function pageLoader(url, path) {
  return url + path;
}
