import axios from 'axios';
import fs from 'fs/promises';
import pathToSave from './pathToSave';

async function loadHtml(url) {
  return axios.get(url).then((response) => response.data);
}

/**
 * Load page by url and save to path
 * @param {string} url page location, url
 * @param {string} path path to save page
 * @returns {{filepath: string}} object with path to saved page
 */
export default async function pageLoader(url, path) {
  const filepath = pathToSave(url, path);
  const html = await loadHtml(url);
  await fs.writeFile(filepath, html);
  return { filepath };
}
