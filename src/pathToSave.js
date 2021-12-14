import path from 'path';
import { cwd } from 'process';
import urlToName from './urlToName';
import getFullPath from './getFullPath';

/**
 * Return full path to save loaded html page
 * @param {string} url page url
 * @param {string} extension file extension
 * @param {string} targetPath target path to save page
 * @returns {string}
 */
export default function pathToSave(url, targetPath = cwd()) {
  const fileName = urlToName(url);
  return getFullPath(path.join(targetPath, fileName));
}
