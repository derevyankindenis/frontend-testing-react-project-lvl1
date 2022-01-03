import fs from "fs/promises";
import axios from "axios";
import log from "./log";
import { FileCantBeLoadedError, FileCantBeSavedError } from "./Errors";

async function loadFile(url) {
  log(`Loading ${url}`);
  return axios
    .get(url, { responseType: "arraybuffer" })
    .then((response) => {
      log(`Loaded ${url}`);
      return response.data;
    })
    .catch((e) => {
      log(e);
      throw new FileCantBeLoadedError(url);
    });
}

const DEFAULT_SAVE_MIDLWARE = (s) => s;

/**
 * Run, before save file
 * @callback onSaveCallback
 * @param {any} file saved file
 */

/**
 *
 * @param {string} url
 * @param {string} pathToSave
 * @param {onSaveCallback} beforeSave
 */
export default async function loadAndSave(url, path, beforeSave = DEFAULT_SAVE_MIDLWARE) {
  const file = await loadFile(url);
  await fs.writeFile(path, beforeSave(file), "utf-8").catch((e) => {
    log(e);
    throw new FileCantBeSavedError(path);
  });
}
