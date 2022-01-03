/* eslint-disable import/prefer-default-export */
export function trimSlash(str) {
  const isNotSlash = (char) => char !== "/";
  const startIndex = [...str].findIndex(isNotSlash);
  const endIndex = str.length - [...str].reverse().findIndex(isNotSlash);
  return str.slice(startIndex, endIndex);
}

export function addExt(filename, ext) {
  return `${filename}.${ext}`;
}

export function fixSlashes(path) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }

  return path.replace(/\\/g, "/");
}
