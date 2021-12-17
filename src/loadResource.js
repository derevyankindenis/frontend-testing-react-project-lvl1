import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
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

function getFullUrl(url, baseUrl) {
  const firstPart = baseUrl[baseUrl.length - 1] === '/' ? baseUrl.slice(-1) : baseUrl;
  const secondPart = url[0] === '/' ? url.slice(1) : url;
  return [firstPart, secondPart].join('/');
}

export async function loadFile(url, baseUrl) {
  const fullUrl = isAbsoluteURL(url) ? url : getFullUrl(url, baseUrl);

  log(`Loading ${fullUrl}`);
  return axios
    .get(fullUrl, { responseType: 'arraybuffer' })
    .then((response) => {
      log(`Loaded ${fullUrl}`);
      const ext = getExtension(url, response);
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
