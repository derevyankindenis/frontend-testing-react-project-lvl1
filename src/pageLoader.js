import fs from 'fs/promises';
import path from 'path';
import pathToSave from './pathToSave';
import { loadFile, saveFile } from './loadResource';
import urlToName from './urlToName';
import getFullPath from './getFullPath';
import isAbsoluteURL from './isAbsoluteURL';
import addExtension from './addExtension';
import createNameToLoadFile from './createNameToLoadFile';
import isExists from './isExists';
import { HTMLAlreadyExistsError, NoDirectoryToSaveError } from './Errors';
import { getUrls, replaceUrls } from './htmlUrlUtils';

async function createDirectoryToFiles(url, mainPath) {
  const dirToFilesName = `${urlToName(url)}_files`;
  const savePath = getFullPath(path.join(mainPath, dirToFilesName));
  if (!isExists(savePath)) {
    await fs.mkdir(savePath);
  }
  return dirToFilesName;
}

function getHTMLName(url, savePath) {
  return addExtension(pathToSave(url, savePath), 'html');
}

function getAbsoluteUrl(baseUrl, url) {
  return isAbsoluteURL(url) ? url : new URL(url, `${baseUrl}/`).toString();
}

async function loadHtml(url) {
  const { file } = await loadFile(url);
  return file;
}

/**
 * Load page by url and save to path
 * @param {string} url page location, url
 * @param {string} pathToSave path to save page
 * @returns {{filepath: string}} object with path to saved page
 */
export default async function pageLoader(url, savePath) {
  if (!isExists(savePath)) {
    throw new NoDirectoryToSaveError(savePath);
  }

  const filepath = getHTMLName(url, savePath);
  if (isExists(filepath)) {
    throw new HTMLAlreadyExistsError(filepath);
  }

  const HTML = await loadHtml(url);
  const urls = getUrls(HTML);
  const pathToSaveFiles = await createDirectoryToFiles(url, savePath);
  const fullUrlToUrl = {};
  const loadedFiles = (
    await Promise.all(
      urls.map((u) => {
        const fullUrl = getAbsoluteUrl(url, u);
        fullUrlToUrl[fullUrl] = u;
        return loadFile(fullUrl).catch(() => {
          console.warn('\x1b[33m', `WARNING! ${fullUrl} has not been loaded`);
        });
      })
    )
  ).filter((a) => a);

  const replaces = {};
  await Promise.all(
    loadedFiles.map((fileInfo) => {
      const fileName = createNameToLoadFile(fileInfo);
      const relativePath = path.join(pathToSaveFiles, fileName);
      replaces[fullUrlToUrl[fileInfo.url]] = relativePath;
      const fullPath = path.join(savePath, relativePath);
      return saveFile(fileInfo.file, fullPath).catch(() => {
        console.warn('\x1b[33m', `WARNING! File ${fileInfo.file} has not been saved`);
      });
    })
  );
  const newHTML = replaceUrls(HTML, replaces);

  await saveFile(newHTML, filepath);

  return { filepath };
}
