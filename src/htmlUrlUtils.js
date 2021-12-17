import cheerio from 'cheerio';
import { flattenDeep, uniq } from 'lodash';
import { parseSrcset, stringifySrcset } from './vendor/srcset';

const SELECTOR_TO_SRC_ATTR = {
  img: 'src',
  source: 'srcset',
  'link[href]': 'href',
  'script[src]': 'src',
};

export function getUrls(HTML) {
  const $ = cheerio.load(HTML);
  return uniq(
    flattenDeep(
      Object.entries(SELECTOR_TO_SRC_ATTR).map(([selector, attribName]) => {
        const elements = $(selector);
        const attrValues = Array.from(elements.map((i, el) => $(el).attr(attribName)));
        return selector !== 'source'
          ? attrValues
          : attrValues.map((set) => parseSrcset(set).map(({ url }) => url));
      })
    )
  );
}

export function replaceUrls(HTML, replaces) {
  const $ = cheerio.load(HTML);

  Object.entries(SELECTOR_TO_SRC_ATTR).forEach(([selector, attribName]) => {
    $(selector).each(function f() {
      const oldValue = $(this).attr(attribName);
      if (selector !== 'source') {
        $(this).attr(attribName, replaces[oldValue] || oldValue);
      } else {
        const parsedSrcSet = parseSrcset(oldValue);
        const srcSetWithReplacedUrls = parsedSrcSet.map((s) => {
          const url = replaces[s.url] || s.url;
          const newSet = { ...s, url };
          return newSet;
        });
        const newValue = stringifySrcset(srcSetWithReplacedUrls);
        $(this).attr(attribName, newValue);
      }
    });
  });

  return $.html();
}
