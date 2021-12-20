import path from 'path';
import joinURLs from 'url-join';
import addExtension from './addExtension';
import isAbsoluteURL from './isAbsoluteURL';
import isSameOrigin from './isSameOrigin';
import urlToName from './urlToName';

function createName(fileInfo) {
  if (isSameOrigin(fileInfo.fullUrl, fileInfo.baseUrl)) {
    const url = isAbsoluteURL(fileInfo.url)
      ? fileInfo.url
      : joinURLs(fileInfo.baseUrl, fileInfo.url);
    return urlToName(url);
  }
  const parsedPath = path.parse(new URL(fileInfo.url).pathname);
  return parsedPath.name;
}

export default function createNameToLoadFile(fileInfo) {
  return addExtension(createName(fileInfo), `${fileInfo.ext}`);
}
