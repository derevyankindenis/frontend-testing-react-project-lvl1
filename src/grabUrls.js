import cheerio from 'cheerio';
import { flatten, uniq } from 'lodash';
import { parseSrcset, stringifySrcset } from './vendor/srcset';

export default function grabUrls(HTML) {
  const $ = cheerio.load(HTML);
  const imgURLs = Array.from($('img').map((i, el) => $(el).attr('src')));
  const styleURLs = Array.from(
    $('link[rel="stylesheet"]').map((i, el) => $(el).attr('href'))
  );
  const scriptsURLs = Array.from(
    $('script[src]').map((i, el) => $(el).attr('src'))
  );
  const srcSets = Array.from($('source').map((i, el) => $(el).attr('srcset')));
  const sourceURLs = flatten(
    srcSets.map((set) => parseSrcset(set).map(({ url }) => url))
  );
  return uniq(imgURLs.concat(sourceURLs, styleURLs, scriptsURLs));
}

export function replaceUrls(HTML, replaces) {
  const $ = cheerio.load(HTML);

  function replaceSrc() {
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

  function replaceStylesHref() {
    const oldValue = $(this).attr('href');
    $(this).attr('href', replaces[oldValue]);
  }

  $('img').each(replaceSrc);
  $('source').each(replaceSourceSrcset);
  $('link[rel="stylesheet"]').each(replaceStylesHref);
  $('script[src]').each(replaceSrc);
  return $.html();
}
