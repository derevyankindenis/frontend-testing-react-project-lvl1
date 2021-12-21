import fs from 'fs/promises';
import { cwd } from 'process';
import path from 'path';
import debug from 'debug';
import joinURLs from 'url-join';
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
import isSameOrigin from './isSameOrigin';
import slash from './vendor/slash';

const log = debug('page-loader');

async function createDirectoryToFiles(url, mainPath = cwd()) {
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

function getAbsoluteUrl(url, baseUrl) {
  return isAbsoluteURL(url) ? url : joinURLs(baseUrl, url);
}

async function loadHtml(url) {
  const { file } = await loadFile(url);
  return file;
}

/**
 * Load page by url and save to path
 * @param {string} url page location, url
 * @param {string} pathToSave path to save page
 * @param {boolean} loadGlobalResurces - load global resources or no
 * @returns {{filepath: string}} object with path to saved page
 */
export default async function pageLoader(url, savePath, loadGlobalResurces = false) {
  log(`### PARAMS: ${url} // ${savePath} // ${loadGlobalResurces}`);
  if (!isExists(savePath)) {
    throw new NoDirectoryToSaveError(savePath);
  }

  const filepath = getHTMLName(url, savePath);
  if (isExists(filepath)) {
    throw new HTMLAlreadyExistsError(filepath);
  }

  const HTML = await loadHtml(url);
  const filterURLs = loadGlobalResurces
    ? () => true
    : (urlFromHtml) => isSameOrigin(url, getAbsoluteUrl(urlFromHtml, url));
  const urls = getUrls(HTML).filter(filterURLs);

  const pathToSaveFiles = await createDirectoryToFiles(url, savePath);
  const loadedFiles = await Promise.all(
    urls.map((u) =>
      loadFile(u, url).catch(() => {
        log('\x1b[33m', `WARNING! ${u} has not been loaded`);
      }))
  );

  const replaces = {};
  await Promise.all(
    loadedFiles
      .filter((a) => a)
      .map((fileInfo) => {
        const fileName = createNameToLoadFile(fileInfo);
        const relativePath = slash(path.join(pathToSaveFiles, fileName));
        replaces[fileInfo.url] = relativePath;
        const fullPath = path.join(savePath, relativePath);
        return saveFile(fileInfo.file, fullPath).catch(() => {
          log('\x1b[33m', `WARNING! File ${fileInfo.file} has not been saved`);
        });
      })
  );
  const newHTML = replaceUrls(HTML, replaces);

  await saveFile(newHTML, filepath);

  return { filepath };
}
