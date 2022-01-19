import fs from 'fs/promises';
import useTransformHTML from '../src/useTransformHTML';
// eslint-disable-next-line
import {
  getFixturePath,
  encode,
} from './testUtils';

const BASE_URL = 'https://site.com';
const ASSETS_PATH = 'site-com-blog-about_files';

const FILE_PATH_BEFORE = getFixturePath('site-com-blog-about.html');
const FILE_PATH_AFTER = getFixturePath('expected/site-com-blog-about.html');

const EXPECTED_URLS = {
  'https://site.com/blog/about/assets/styles.css': 'site-com-blog-about_files/site-com-blog-about-assets-styles.css',
  'https://site.com/blog/about': 'site-com-blog-about_files/site-com-blog-about.html',
  'https://site.com/photos/me.jpg': 'site-com-blog-about_files/site-com-photos-me.jpg',
  'https://site.com/assets/scripts.js': 'site-com-blog-about_files/site-com-assets-scripts.js',
  'https://site.com/photos/me2.jpg': 'site-com-blog-about_files/site-com-photos-me2.jpg',
};

test('useTransformHTML', async () => {
  const [urls, transform] = useTransformHTML(BASE_URL, ASSETS_PATH);
  const beforeFile = await fs.readFile(FILE_PATH_BEFORE, encode);
  const expectedFile = await fs.readFile(FILE_PATH_AFTER, encode);
  const resultFile = transform(beforeFile);
  expect(urls).toEqual(EXPECTED_URLS);
  expect(resultFile.trim()).toEqual(expectedFile.trim());
});
