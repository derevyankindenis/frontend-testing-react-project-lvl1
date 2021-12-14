import fs from 'fs';

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
