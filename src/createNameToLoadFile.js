import path from 'path';
import addExtension from './addExtension';

export default function createNameToLoadFile(fileInfo) {
  const fileName = path.parse(new URL(fileInfo.url).pathname).name;
  return addExtension(fileName, `${fileInfo.ext}`);
}
