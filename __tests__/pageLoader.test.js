import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nock from 'nock';
import pageLoader from '../src/pageLoader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);

const encode = {
  encoding: 'utf-8',
};

const EXAMPLE_HTML_PATH = getFixturePath('example.html');

afterAll(async () => {
  await fs.promises.unlink(EXAMPLE_HTML_PATH);
});

test('pageLoader', async () => {
  const url = 'https://example.com/page';
  const pathToSave = os.tmpdir();
  const htmlExample = await fs.readFile(EXAMPLE_HTML_PATH, encode);
  const scope = nock(url).get('/').reply(200, htmlExample);
  const result = await pageLoader(url, pathToSave);
  const expectedFileName = 'example-com-page.html';
  const filepath = path.join(os.tmpdir(), expectedFileName);

  expect(result).toEqual({ filepath });
  expect(scope.isDone()).toBeTruthy();

  const savedPage = await fs.readFile(filepath, encode);

  expect(savedPage).toEqual(htmlExample);
});
