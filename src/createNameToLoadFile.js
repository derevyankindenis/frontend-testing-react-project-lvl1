import path from 'path';
import addExtension from './addExtension';
import isSameOrigin from './isSameOrigin';
import urlToName from './urlToName';

function createName(fileInfo) {
  if (fileInfo.fullUrl === fileInfo.url) {
    if (isSameOrigin(fileInfo.url, fileInfo.baseUrl)) {
      const relativeUrl = fileInfo.url.slice(fileInfo.baseUrl.length + 1);
      return urlToName(relativeUrl);
    }
    const parsedPath = path.parse(new URL(fileInfo.url).pathname);
    return parsedPath.name;
  }
  return urlToName(fileInfo.url);
}

export default function createNameToLoadFile(fileInfo) {
  return addExtension(createName(fileInfo), `${fileInfo.ext}`);
}
