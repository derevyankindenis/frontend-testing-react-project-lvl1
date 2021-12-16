/**
 * Concate file name with its extension
 * @param {string} fileName - file name
 * @param {string} extension - extension, like html, css, js
 * @returns full name of file
 */
export default function addExtension(fileName, extension) {
  return `${fileName}.${extension}`;
}
