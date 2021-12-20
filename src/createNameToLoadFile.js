import path from 'path';
import addExtension from './addExtension';
import isSameOrigin from './isSameOrigin';
import urlToName from './urlToName';

function createName(fileInfo) {
  if (isSameOrigin(fileInfo.fullUrl, fileInfo.baseUrl)) {
    return urlToName(fileInfo.fullUrl);
  }
  const parsedPath = path.parse(new URL(fileInfo.url).pathname);
  return parsedPath.name;
}

export default function createNameToLoadFile(fileInfo) {
  return addExtension(createName(fileInfo), `${fileInfo.ext}`);
}
