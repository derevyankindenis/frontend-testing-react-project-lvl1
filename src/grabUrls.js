import cheerio from 'cheerio';
import { flatten, uniq } from 'lodash';
import { parseSrcset, stringifySrcset } from './vendor/srcset';

export default function grabUrls(HTML) {
  const $ = cheerio.load(HTML);
  const imgURLs = Array.from($('img').map((i, el) => $(el).attr('src')));
  const srcSets = Array.from($('source').map((i, el) => $(el).attr('srcset')));
  const sourceURLs = flatten(
    srcSets.map((set) => parseSrcset(set).map(({ url }) => url))
  );
  return uniq(imgURLs.concat(sourceURLs));
}

export function replaceUrls(HTML, replaces) {
  const $ = cheerio.load(HTML);

  function replaceImgSrc() {
    const oldValue = $(this).attr('src');
    const newValue = replaces[oldValue];
    $(this).attr('src', newValue);
  }

  function replaceSourceSrcset() {
    const oldValue = $(this).attr('srcset');
    const parsedSrcSet = parseSrcset(oldValue);
    const srcSetWithReplacedUrls = parsedSrcSet.map((s) => {
      const url = replaces[s.url];
      const newSet = { ...s, url };
      return newSet;
    });
    const newValue = stringifySrcset(srcSetWithReplacedUrls);
    $(this).attr('srcset', newValue);
  }

  $('img').each(replaceImgSrc);
  $('source').each(replaceSourceSrcset);
  return $.html();
}
