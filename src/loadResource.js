import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';

export async function loadFile(url) {
  return axios.get(url, { responseType: 'arraybuffer' }).then((response) => ({
    file: response.data,
    contentType: response.headers['content-type'],
    url,
    name: path.parse(response.request.path).base,
  }));
}

export async function saveFile(file, pathToSave) {
  return fs.writeFile(pathToSave, file, 'utf-8');
}

/**
 * Callback which is calling between load and save resource
 * @callback onSave
 * @param {string} resource - loaded resource
 */

/**
 * Load and save one resource
 * @param {string} url - url to load resource
 * @param {string} pathToSave - path to save resource
 * @param {onSave} onSave - callback which is calling between load and save resource
 */
export default async function loadResource(
  url,
  pathToSave,
  fileName,
  onSave = (file) => file
) {
  const { file } = await loadFile(url);
  return saveFile(onSave(file), pathToSave);
}
