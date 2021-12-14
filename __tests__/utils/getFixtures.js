import path from 'path';

export default function getFixturePath(filename) {
  return path.join(__dirname, '../__fixtures__', filename);
}
