import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nock from 'nock';
import pageLoader from '../src/pageLoader';

const noop = () => {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '__fixtures__', filename);

const encode = {
  encoding: 'utf-8',
};

const TEST_URL = 'https://example.com/page';
const EXAMPLE_HTML_PATH = getFixturePath('example.html');
const TEST_DIR = path.join(os.tmpdir(), `jest-test-${new Date().getTime()}`);
const TEST_FILE_NAME = 'example-com-page.html';
const TEST_FILE_PATH = path.join(TEST_DIR, TEST_FILE_NAME);

let htmlExample;

beforeAll(async () => {
  await fs.mkdir(TEST_DIR);
  htmlExample = await fs.readFile(EXAMPLE_HTML_PATH, encode);
});

afterAll(async () => {
  await fs.rmdir(TEST_DIR, { recursive: true }).catch(noop);
});

afterEach(async () => {
  await fs.unlink(TEST_FILE_PATH).catch(noop);
});

describe('pageLoader', () => {
  test('Load and save html page to define directory', async () => {
    const scope = nock(TEST_URL).get('').reply(200, htmlExample);
    const result = await pageLoader(TEST_URL, TEST_DIR);
    const filepath = path.join(TEST_DIR, TEST_FILE_NAME);

    expect(result).toEqual({ filepath });
    expect(scope.isDone()).toBeTruthy();

    const savedPage = await fs.readFile(filepath, encode);
    expect(savedPage).toEqual(htmlExample);
  });
});
