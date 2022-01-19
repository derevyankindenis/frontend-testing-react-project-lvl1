import fs from 'fs';

/**
 * Check existing path
 * @param {string} path - path (with file name) to file
 * @returns {boolean} true - file exists, false - file does't exist
 */
export default function isExists(path) {
  try {
    fs.accessSync(path);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
  }
  return true;
}
