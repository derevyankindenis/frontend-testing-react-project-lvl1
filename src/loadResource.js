import fs from 'fs/promises';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import axiosDebug from 'axios-debug-log';
import mime from 'mime-types';
import debug from 'debug';
import { FileCantBeLoadedError, FileCantBeSavedError } from './Errors';

const log = debug('page-loader');

export async function loadFile(url) {
  log(`Loading ${url}`);
  return axios
    .get(url, { responseType: 'arraybuffer' })
    .then((response) => {
      log(`Loaded ${url}`);
      const ext = mime.extension(response.headers['content-type']);
      return {
        file: response.data,
        url,
        ext,
      };
    })
    .catch((e) => {
      log(e);
      throw new FileCantBeLoadedError(url);
    });
}

export async function saveFile(file, pathToSave) {
  return fs.writeFile(pathToSave, file, 'utf-8').catch((e) => {
    log(e);
    throw new FileCantBeSavedError(file);
  });
}
