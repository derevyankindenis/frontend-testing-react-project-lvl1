import path from 'path';
import { fixSlashes } from './utils';
import URL from './ExtendedURL';

export default function useReplacer(baseUrl, pathToSave) {
  const urls = {};
  const replace = (u) => {
    const oldUrl = new URL(u, baseUrl);
    if (!oldUrl.isGlobal) {
      const newUrl = fixSlashes(path.join(pathToSave, oldUrl.toFileName()));
      urls[oldUrl] = newUrl;
      return newUrl;
    }
    return undefined;
  };

  return [urls, replace];
}
