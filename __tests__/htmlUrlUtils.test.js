import fs from 'fs/promises';
import getFixturePath from './utils/getFixtures';
import encodeUTF8 from './utils/encodeUTF8';
import { getUrls, replaceUrls } from '../src/htmlUrlUtils';

const FIXTURE_HTML_BEFORE_PATH = getFixturePath('example.html');
const FIXTURE_HTML_AFTER_PATH = getFixturePath('savedExample.html');

describe('htmlUrlUtils', () => {
  test('getUrls', async () => {
    const targetHTML = await fs.readFile(FIXTURE_HTML_BEFORE_PATH, encodeUTF8);
    const urls = getUrls(targetHTML);
    const expectedUrls = [
      'nodejs.png',
      'style.css',
      'scripts/main/script.js',
      'file_is_not_exists.js',
      '/blog/about',
      'https://cdn2.hexlet.io/file.jpg',
    ].sort();
    expect(urls.sort()).toEqual(expectedUrls);
  });

  test('replaceUrls', async () => {
    const targetHTML = await fs.readFile(FIXTURE_HTML_BEFORE_PATH, encodeUTF8);
    const expectedHTML = await fs.readFile(FIXTURE_HTML_AFTER_PATH, encodeUTF8);
    const replaces = {
      'nodejs.png': 'example-com-page_files/example-com-page-nodejs.png',
      'style.css': 'example-com-page_files/example-com-page-style.css',
      'scripts/main/script.js': 'example-com-page_files/example-com-page-scripts-main-script.js',
      '/blog/about': 'example-com-page_files/example-com-page-blog-about.html'
    };
    const resultHTML = replaceUrls(targetHTML, replaces);
    expect(resultHTML).toEqual(expectedHTML);
  });
});
