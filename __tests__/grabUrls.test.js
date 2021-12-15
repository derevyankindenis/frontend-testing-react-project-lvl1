import fs from 'fs/promises';
import getFixturePath from './utils/getFixtures';
import encode from './utils/encodeUTF8';
import grabUrls from '../src/grabUrls';

const FIXTURE_HTML_PATH = getFixturePath('example.html');

test('grabUrls', async () => {
  const targetHTML = await fs.readFile(FIXTURE_HTML_PATH, encode);
  const urls = grabUrls(targetHTML);
  const expectedUrls = ['nodejs.png', 'https://pictures/javascript.jpg', 'style.css', 'script.js'].sort();
  expect(urls.sort()).toEqual(expectedUrls);
});
