import path from 'path';
import { cwd } from 'process';
import urlToFileName from './urlToFileName';
import getFullPath from './getFullPath';

/**
 * Return full path to save loaded html page
 * @param {string} url page url
 * @param {string} targetPath target path to save page
 * @returns {string}
 */
export default function pathToSave(url, targetPath = cwd()) {
  const fileName = urlToFileName(url);
  return getFullPath(path.join(targetPath, fileName));
}
