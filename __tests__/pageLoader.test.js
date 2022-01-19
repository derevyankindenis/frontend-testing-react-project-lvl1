import path from 'path';
import fs from 'fs/promises';
import nock from 'nock';
import rimraf from 'rimraf';
import pageLoader from '../index';
// prettier-ignore
import {
  NoDirectoryToSaveError,
  InvalidURLError,
  HTMLAlreadyExistsError,
  FileCantBeLoadedError,
} from '../src/Errors';
// eslint-disable-next-line
// prettier-ignore
import {
  generatePathToRunTests,
  noop,
  getFixturePath,
  encode,
} from './testUtils';

const DIR_TO_RUN_TEST = generatePathToRunTests();

const BASE_URL = 'https://site.com';
const URL = '/blog/about';
const FULL_URL = `${BASE_URL}${URL}`;
const CONTENT_TYPE_HTML = { 'Content-Type': 'text/html' };

const DIR_NAME_TO_FILES = 'site-com-blog-about_files';
const PATH_TO_FILES = path.join(DIR_TO_RUN_TEST, DIR_NAME_TO_FILES);
const HTML_FILE_NAME = 'site-com-blog-about.html';
const FIXTURE_HTML_PATH_BEFORE = getFixturePath('site-com-blog-about.html');
const FIXTURE_HTML_PATH_AFTER = getFixturePath(`expected/${HTML_FILE_NAME}`);

const getExpectedAssetPath = (fileName) => getFixturePath(`expected/site-com-blog-about_files/${fileName}`);

const ASSETS = [
  {
    fixturePath: getExpectedAssetPath('site-com-photos-me.jpg'),
    contentType: { 'Content-Type': 'image/jpeg' },
    url: 'https://site.com/photos/me.jpg',
    pathAfterSave: path.join(PATH_TO_FILES, 'site-com-photos-me.jpg'),
  },
  {
    fixturePath: getExpectedAssetPath('site-com-blog-about-assets-styles.css'),
    contentType: { 'Content-Type': 'text/css' },
    url: 'https://site.com/blog/about/assets/styles.css',
    pathAfterSave: path.join(PATH_TO_FILES, 'site-com-blog-about-assets-styles.css'),
  },
  {
    fixturePath: getExpectedAssetPath('site-com-assets-scripts.js'),
    contentType: { 'Content-Type': 'application/javascript' },
    url: 'https://site.com/assets/scripts.js',
    pathAfterSave: path.join(PATH_TO_FILES, 'site-com-assets-scripts.js'),
  },
  {
    fixturePath: getExpectedAssetPath('site-com-blog-about.html'),
    contentType: { 'Content-Type': 'text/html' },
    url: 'https://site.com/blog/about',
    pathAfterSave: path.join(PATH_TO_FILES, 'site-com-blog-about.html'),
  },
];

const NON_AVALIABLE_ASSETS = ['https://site.com/photos/me2.jpg'];

beforeAll(async () => {
  nock.disableNetConnect();
  await fs.mkdir(DIR_TO_RUN_TEST);
});

afterAll(async () => {
  await fs.rm(DIR_TO_RUN_TEST, { recursive: true }).catch(noop);
  nock.enableNetConnect();
});

beforeEach(() => {
  // TODO: .persist()
  nock(BASE_URL).get(URL).replyWithFile(200, FIXTURE_HTML_PATH_BEFORE, CONTENT_TYPE_HTML);
  ASSETS.forEach((asset) => nock(asset.url).get('').replyWithFile(200, asset.fixturePath, asset.contentType));
  NON_AVALIABLE_ASSETS.forEach((url) => nock(url).get('').reply(404));
});

afterEach(async () => {
  nock.cleanAll();
  await new Promise((resolve) => {
    rimraf(`${DIR_TO_RUN_TEST}/*`, () => {
      resolve();
    });
  });
});

describe('positive cases', () => {
  test('load main html', async () => {
    const result = await pageLoader(FULL_URL, DIR_TO_RUN_TEST);
    const expectedHTML = await fs.readFile(FIXTURE_HTML_PATH_AFTER, encode);
    const resultHTML = await fs.readFile(result.filepath, encode);
    expect(resultHTML).toEqual(expectedHTML);
  });

  test.each(ASSETS)('load resources $url', async (asset) => {
    await pageLoader(FULL_URL, DIR_TO_RUN_TEST);
    const expectedAsset = await fs.readFile(asset.fixturePath, encode);
    const resultAsset = await fs.readFile(asset.pathAfterSave, encode);
    expect(resultAsset).toEqual(expectedAsset);
  });
});

describe('negative cases', () => {
  test('throw exeption if run with invalid url', async () => {
    expect.assertions(1);
    await expect(pageLoader('invalidURL', DIR_TO_RUN_TEST)).rejects.toThrow(InvalidURLError);
  });

  test('throw exeptions if html already exists', async () => {
    expect.assertions(1);
    const pathToHTML = path.join(DIR_TO_RUN_TEST, 'site-com-blog-about.html');
    await fs.writeFile(pathToHTML, '<html></html>', 'utf-8');
    await expect(pageLoader(FULL_URL, DIR_TO_RUN_TEST)).rejects.toThrow(HTMLAlreadyExistsError);
  });

  test("throw exeption if html can't be saved", async () => {
    expect.assertions(1);
    const notExistsDir = path.join(DIR_TO_RUN_TEST, 'no-exists');
    await expect(pageLoader(FULL_URL, notExistsDir)).rejects.toThrow(NoDirectoryToSaveError);
  });

  test.each([401, 403, 404, 500, 503])(
    "throw exeption if main url doesn't avaliable, server returns %d",
    async (code) => {
      expect.assertions(1);
      const url = 'https://example.com';
      nock(url).get('/').reply(code);
      await expect(pageLoader(url, DIR_TO_RUN_TEST)).rejects.toThrow(FileCantBeLoadedError);
    },
  );
});
