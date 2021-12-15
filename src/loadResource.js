import fs from 'fs/promises';
import axios from 'axios';
import contentTypeParser from 'content-type-parser';

export async function loadFile(url) {
  return axios.get(url, { responseType: 'arraybuffer' }).then((response) => {
    const contentType = response.headers['content-type'];
    const type = contentTypeParser(response.headers['content-type']).subtype;
    const ext = type === 'javascript' ? '.js' : `.${type}`;
    return {
      file: response.data,
      contentType,
      url,
      ext,
    };
  });
}

export async function saveFile(file, pathToSave) {
  return fs.writeFile(pathToSave, file, 'utf-8');
}
