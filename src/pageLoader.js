import fs from 'fs/promises';
import path from 'path';
import pathToSave from './pathToSave';
import { loadFile, saveFile } from './loadResource';
import urlToName from './urlToName';
import getFullPath from './getFullPath';
import isAbsoluteURL from './isAbsoluteURL';
import grabUrls, { replaceUrls } from './grabUrls';

function addExtension(fileName, extension) {
  return `${fileName}${extension}`;
}

async function createDirectoryToFiles(url, mainPath) {
  const dirToFilesName = addExtension(urlToName(url), '_files');
  const savePath = getFullPath(path.join(mainPath, dirToFilesName));
  await fs.mkdir(savePath);
  return dirToFilesName;
}

function getHTMLName(url, savePath) {
  return addExtension(pathToSave(url, savePath), '.html');
}

function getAbsoluteUrl(baseUrl, url) {
  return isAbsoluteURL(url) ? url : new URL(url, `${baseUrl}/`).toString();
}

async function loadHtml(url) {
  const { file } = await loadFile(url);
  return file;
}

let namesCount = 0;
function generateName() {
  namesCount += 1;
  return `file_${namesCount}`;
}

/**
 * Load page by url and save to path
 * @param {string} url page location, url
 * @param {string} pathToSave path to save page
 * @returns {{filepath: string}} object with path to saved page
 */
export default async function pageLoader(url, savePath) {
  const HTML = await loadHtml(url);
  const urls = grabUrls(HTML);
  const pathToSaveFiles = await createDirectoryToFiles(url, savePath);
  const fullUrlToUrl = {};
  const loadedFiles = await Promise.all(
    urls.map((u) => {
      const fullUrl = getAbsoluteUrl(url, u);
      fullUrlToUrl[fullUrl] = u;
      return loadFile(fullUrl);
    })
  );

  const replaces = {};
  await Promise.all(
    loadedFiles.map((fileInfo) => {
      const fileName = addExtension(generateName(), fileInfo.ext);
      const relativePath = path.join(pathToSaveFiles, fileName);
      replaces[fullUrlToUrl[fileInfo.url]] = relativePath;
      const fullPath = path.join(savePath, relativePath);
      return saveFile(fileInfo.file, fullPath);
    })
  );
  const newHTML = replaceUrls(HTML, replaces);

  const filepath = getHTMLName(url, savePath);
  await saveFile(newHTML, filepath);
  return { filepath };
}
