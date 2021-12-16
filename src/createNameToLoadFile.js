import path from 'path';
import addExtension from './addExtension';

export default function createNameToLoadFile(fileInfo) {
  const parsedPath = path.parse(new URL(fileInfo.url).pathname);
  const fileName = parsedPath.name;
  const ext = fileInfo.ext || parsedPath.ext;
  return addExtension(fileName, `${ext}`);
}
