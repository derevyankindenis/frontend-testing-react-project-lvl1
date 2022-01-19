import { cwd } from 'process';
import fs from 'fs/promises';
import path from 'path';
import log from './log';
import isExists from './isExists';
import URL from './ExtendedURL';
import { NoDirectoryToSaveError, InvalidURLError, HTMLAlreadyExistsError } from './Errors';
import loadAndSave from './loadAndSave';
import getFullPath from './getFullPath';
import useTransformHTML from './useTransformHTML';

async function createDirectoryToFiles(url, mainPath) {
  const fileNameWithoutExt = url.toFileName().split('.')[0];
  const dirToFilesName = [fileNameWithoutExt, 'files'].join('_');
  const savePath = getFullPath(path.join(mainPath, dirToFilesName));
  if (!isExists(savePath)) {
    await fs.mkdir(savePath);
  }
  return dirToFilesName;
}

/**
 * Load web page by url and save to savePath
 * @param {string} url - page location, url
 * @param {string} pathToSave - path to save page
 * @returns {{filepath: string}} object with path to saved page
 */
export default async function pageLoader(url, savePath = cwd()) {
  log('\x1b[32m', `run with ${url} ${savePath}`);

  if (!isExists(savePath)) {
    throw new NoDirectoryToSaveError(savePath);
  }

  if (!URL.isValidURL(url)) {
    throw new InvalidURLError(url);
  }

  const initialURL = new URL(url);
  const filepath = path.join(savePath, initialURL.toFileName());

  if (isExists(filepath)) {
    throw new HTMLAlreadyExistsError(filepath);
  }

  const pathToSaveFiles = await createDirectoryToFiles(initialURL, savePath);
  const [urls, transform] = useTransformHTML(initialURL.origin, pathToSaveFiles);

  await loadAndSave(url, filepath, transform);
  await Promise.all(
    Object.entries(urls).map(([from, to]) =>
      loadAndSave(from, getFullPath(path.join(savePath, to))).catch(() => {
        log('\x1b[33m', `WARNING! ${from} has not been loaded and saved \n\t       ${savePath} \n\t       ${to}`);
      })
    )
  );

  return Promise.resolve({ filepath });
}
