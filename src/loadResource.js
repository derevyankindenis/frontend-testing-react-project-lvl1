import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import joinURLs from 'url-join';
// eslint-disable-next-line no-unused-vars
import axiosDebug from 'axios-debug-log';
import mime from 'mime-types';
import debug from 'debug';
import { FileCantBeLoadedError, FileCantBeSavedError } from './Errors';
import isAbsoluteURL from './isAbsoluteURL';

const log = debug('page-loader');

function getExtension(url, response) {
  const ext = mime.extension(response.headers['content-type']);
  if (ext) return ext;
  const parsedPath = path.parse(new URL(url).pathname);
  return parsedPath.ext.split('.')[1];
}

export async function loadFile(url, baseUrl) {
  const fullUrl = isAbsoluteURL(url) ? url : joinURLs(new URL(baseUrl).origin, url);

  log(`Loading ${fullUrl}`);
  return axios
    .get(fullUrl, { responseType: 'arraybuffer' })
    .then((response) => {
      log(`Loaded ${fullUrl}`);
      const ext = getExtension(fullUrl, response);
      return {
        file: response.data,
        fullUrl,
        url,
        baseUrl,
        ext,
      };
    })
    .catch((e) => {
      log(e);
      throw new FileCantBeLoadedError(fullUrl);
    });
}

export async function saveFile(file, pathToSave) {
  return fs.writeFile(pathToSave, file, 'utf-8').catch((e) => {
    log(e);
    throw new FileCantBeSavedError(file);
  });
}
