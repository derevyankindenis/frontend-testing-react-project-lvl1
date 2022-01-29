import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import nock from 'nock';
import pageLoader from '../index';
import {
  NoDirectoryToSaveError,
  InvalidURLError,
  HTMLAlreadyExistsError,
  FileCantBeLoadedError,
} from '../src/Errors';

const encode = { encoding: 'utf-8' };

function getFixturePath(filename) {
  return path.join(__dirname, '..', '__tests__', '__fixtures__', filename);
}

const BASE_URL = 'https://site.com';
const URL = '/blog/about';
const FULL_URL = `${BASE_URL}${URL}`;
const CONTENT_TYPE_HTML = { 'Content-Type': 'text/html' };

const DIR_NAME_TO_FILES = 'site-com-blog-about_files';
const HTML_FILE_NAME = 'site-com-blog-about.html';
const FIXTURE_HTML_PATH_BEFORE = getFixturePath(HTML_FILE_NAME);
const FIXTURE_HTML_PATH_AFTER = getFixturePath(`expected/${HTML_FILE_NAME}`);

const getExpectedAssetPath = (fileName) => getFixturePath(`expected/site-com-blog-about_files/${fileName}`);

const ASSETS = [
  {
    fixturePath: getExpectedAssetPath('site-com-photos-me.jpg'),
    contentType: { 'Content-Type': 'image/jpeg' },
    url: '/photos/me.jpg',
    fileName: 'site-com-photos-me.jpg',
  },
  {
    fixturePath: getExpectedAssetPath('site-com-blog-about-assets-styles.css'),
    contentType: { 'Content-Type': 'text/css' },
    url: '/blog/about/assets/styles.css',
    fileName: 'site-com-blog-about-assets-styles.css',
  },
  {
    fixturePath: getExpectedAssetPath('site-com-assets-scripts.js'),
    contentType: { 'Content-Type': 'application/javascript' },
    url: '/assets/scripts.js',
    fileName: 'site-com-assets-scripts.js',
  },
  {
    fixturePath: getExpectedAssetPath(HTML_FILE_NAME),
    contentType: { 'Content-Type': 'text/html' },
    url: '/blog/about',
    fileName: HTML_FILE_NAME,
  },
];

const NON_AVALIABLE_ASSETS = ['/photos/me2.jpg'];

let DIR_TO_RUN_TEST;
let PATH_TO_FILES;

beforeAll(() => {
  nock.disableNetConnect();
  nock(BASE_URL)
    .persist(true)
    .get(URL)
    .replyWithFile(200, FIXTURE_HTML_PATH_BEFORE, CONTENT_TYPE_HTML);
  ASSETS.forEach((asset) => nock(BASE_URL)
    .persist(true)
    .get(asset.url)
    .replyWithFile(200, asset.fixturePath, asset.contentType));
  NON_AVALIABLE_ASSETS.forEach((url) => nock(BASE_URL).persist(true).get(url).reply(404));
});

beforeEach(async () => {
  DIR_TO_RUN_TEST = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-test'));
  PATH_TO_FILES = path.join(DIR_TO_RUN_TEST, DIR_NAME_TO_FILES);
});

afterAll(async () => {
  nock.cleanAll();
  nock.enableNetConnect();
});

describe('positive cases', () => {
  test('load main html', async () => {
    const result = await pageLoader(FULL_URL, DIR_TO_RUN_TEST);
    const expectedHTML = await fs.readFile(FIXTURE_HTML_PATH_AFTER, encode);
    const resultHTML = await fs.readFile(result.filepath, encode);
    const expectedPathAfterSave = path.join(DIR_TO_RUN_TEST, HTML_FILE_NAME);
    expect(resultHTML).toEqual(expectedHTML);
    expect(result.filepath).toEqual(expectedPathAfterSave);
  });

  test.each(ASSETS)('load resources $fileName', async (asset) => {
    await pageLoader(FULL_URL, DIR_TO_RUN_TEST);
    const expectedAsset = await fs.readFile(asset.fixturePath, encode);
    const pathAfterSave = path.join(PATH_TO_FILES, asset.fileName);
    const resultAsset = await fs.readFile(pathAfterSave, encode);
    expect(resultAsset).toEqual(expectedAsset);
  });
});

describe('negative cases', () => {
  test('throw exeption if run with invalid url', async () => {
    await expect(pageLoader('invalidURL', DIR_TO_RUN_TEST)).rejects.toThrow(InvalidURLError);
  });

  test('throw exeptions if html already exists', async () => {
    const pathToHTML = path.join(DIR_TO_RUN_TEST, HTML_FILE_NAME);
    await fs.writeFile(pathToHTML, '<html></html>', 'utf-8');
    await expect(pageLoader(FULL_URL, DIR_TO_RUN_TEST)).rejects.toThrow(HTMLAlreadyExistsError);
  });

  test("throw exeption if html can't be saved", async () => {
    const notExistsDir = path.join(DIR_TO_RUN_TEST, 'no-exists');
    await expect(pageLoader(FULL_URL, notExistsDir)).rejects.toThrow(NoDirectoryToSaveError);
  });

  test.each([401, 403, 404, 500, 503])(
    "throw exeption if main url doesn't avaliable, server returns %d",
    async (code) => {
      const url = 'https://example.com';
      nock(url).get('/').reply(code);
      await expect(pageLoader(url, DIR_TO_RUN_TEST)).rejects.toThrow(FileCantBeLoadedError);
    },
  );
});
