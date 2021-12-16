import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';
import getFixturePath from './utils/getFixtures';
import mkDirToRunTests from './utils/mkDirToRunTest';
import encodeUTF8 from './utils/encodeUTF8';
import noop from './utils/noop';
import pageLoader from '../src/pageLoader';
import isExists from '../src/isExists';
import {
  FileCantBeLoadedError,
  // FileCantBeSavedError,
  NoDirectoryToSaveError,
  HTMLAlreadyExistsError,
} from '../src/Errors';

const TEST_URL = 'https://example.com/page';
const DIR_TO_RUN_TEST = mkDirToRunTests();

const HTML_FILE_NAME = 'example-com-page.html';

const DIR_NAME_TO_FILES = 'example-com-page_files';
const PATH_TO_FILES = path.join(DIR_TO_RUN_TEST, DIR_NAME_TO_FILES);

const PATH_TO_HTML = path.join(DIR_TO_RUN_TEST, HTML_FILE_NAME);

const CONTENT_TYPE_HTML = { 'Content-Type': 'text/html' };
const FIXTURE_HTML_PATH_AFTER = getFixturePath('savedExample.html');
const FIXTURE_HTML_PATH_BEFORE = getFixturePath('example.html');

let fixtureHtmlContent;

let ASSETS = [
  {
    fixturePath: getFixturePath('nodejs.png'),
    contentType: { 'Content-Type': 'image/png' },
    fileName: 'nodejs.png',
    url: 'https://example.com/page/nodejs.png',
  },
  {
    fixturePath: getFixturePath('javascript.jpg'),
    contentType: { 'Content-Type': 'image/jpeg' },
    fileName: 'file.jpeg',
    url: 'https://cdn2.hexlet.io',
    uri: '/derivations/image/fill_jpg/540/320/file',
    query: { signature: '5971e' },
  },
  {
    fixturePath: getFixturePath('style.css'),
    contentType: { 'Content-Type': 'text/css' },
    fileName: 'style.css',
    url: 'https://example.com/page/style.css',
  },
  {
    fixturePath: getFixturePath('script.js'),
    contentType: { 'Content-Type': 'application/javascript' },
    fileName: 'script.js',
    url: 'https://example.com/page/script.js',
  },
];

async function initAsset(asset) {
  const pathAfterSave = path.join(PATH_TO_FILES, asset.fileName);
  const content = await fs.readFile(asset.fixturePath, encodeUTF8);
  return { ...asset, pathAfterSave, content };
}

async function initializeAssets(assets) {
  return Promise.all(assets.map(initAsset));
}

beforeAll(async () => {
  nock.disableNetConnect();
  await fs.mkdir(DIR_TO_RUN_TEST);
  ASSETS = await initializeAssets(ASSETS);
  fixtureHtmlContent = await fs.readFile(FIXTURE_HTML_PATH_AFTER, encodeUTF8);
});

afterAll(async () => {
  await fs.rm(DIR_TO_RUN_TEST, { recursive: true }).catch(noop);
  nock.enableNetConnect();
});

afterEach(async () => {
  nock.cleanAll();
  await Promise.all([
    fs.unlink(PATH_TO_HTML),
    fs.rm(PATH_TO_FILES, { recursive: true }),
  ]).catch(noop);
});

describe('pageLoader', () => {
  test('Load and save html page to define directory', async () => {
    const assetsRequests = ASSETS.map((asset) =>
      nock(asset.url)
        .get(asset.uri || '')
        .query(asset.query || {})
        .replyWithFile(200, asset.fixturePath, asset.contentType));

    const mainReq = nock(TEST_URL)
      .get('')
      .replyWithFile(200, FIXTURE_HTML_PATH_BEFORE, CONTENT_TYPE_HTML);

    const result = await pageLoader(TEST_URL, DIR_TO_RUN_TEST);
    expect(result).toEqual({ filepath: PATH_TO_HTML });
    expect(isExists(PATH_TO_FILES)).toBeTruthy();

    expect(mainReq.isDone()).toBeTruthy();
    expect(isExists(PATH_TO_HTML)).toBeTruthy();

    expect(await fs.readFile(PATH_TO_HTML, encodeUTF8)).toEqual(fixtureHtmlContent);

    assetsRequests.forEach((request) => {
      expect(request.isDone()).toBeTruthy();
    });

    ASSETS.forEach((asset) => expect(isExists(asset.pathAfterSave)).toBeTruthy());
    const fileContents = await Promise.all(
      ASSETS.map((asset) =>
        fs
          .readFile(asset.pathAfterSave, encodeUTF8)
          .then((file) => ({ resultFile: file, expectedFile: asset.content })))
    );
    fileContents.forEach(({ resultFile, expectedFile }) =>
      expect(resultFile).toEqual(expectedFile));
  });

  test("throw exeption if main url isn't avaliable", async () => {
    expect.assertions(1);
    nock(TEST_URL).get('').reply(404);
    await expect(pageLoader(TEST_URL, DIR_TO_RUN_TEST)).rejects.toThrow(
      FileCantBeLoadedError
    );
  });

  test("throw exeption if html can't be saved", async () => {
    expect.assertions(1);
    const notExistsDir = path.join(DIR_TO_RUN_TEST, 'noExists');
    nock(TEST_URL)
      .get('')
      .replyWithFile(200, FIXTURE_HTML_PATH_BEFORE, CONTENT_TYPE_HTML);
    await expect(pageLoader(TEST_URL, notExistsDir)).rejects.toThrow(
      NoDirectoryToSaveError
    );
  });

  test('throw exeption if html already exists', async () => {
    expect.assertions(1);
    await fs.writeFile(PATH_TO_HTML, fixtureHtmlContent, 'utf-8');
    await expect(pageLoader(TEST_URL, DIR_TO_RUN_TEST)).rejects.toThrow(
      HTMLAlreadyExistsError
    );
  });

  test("doesn't throw if any assets isn't avaliable", async () => {
    expect.assertions(1);
    nock(TEST_URL)
      .get('')
      .replyWithFile(200, FIXTURE_HTML_PATH_BEFORE, CONTENT_TYPE_HTML);
    await expect(pageLoader(TEST_URL, DIR_TO_RUN_TEST)).resolves.toEqual({
      filepath: PATH_TO_HTML,
    });
  });
});
