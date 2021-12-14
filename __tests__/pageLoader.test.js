import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';
import getFixturePath from './utils/getFixtures';
import mkDirToRunTests from './utils/mkDirToRunTest';
import encodeUTF8 from './utils/encodeUTF8';
import noop from './utils/noop';
import pageLoader from '../src/pageLoader';
import isExists from '../src/isExists';

const TEST_URL = 'https://example.com/page';
const PNG_URL = 'https://example.com/page/nodejs.png';
const JPG_URL = 'https://pictures/javascript.jpg';
const DIR_TO_RUN_TEST = mkDirToRunTests();

const HTML_FILE_NAME = 'example-com-page.html';
const PNG_FILENAME = 'file_1.png';
const DIR_NAME_TO_FILES = 'example-com-page_files';
const PATH_TO_HTML = path.join(DIR_TO_RUN_TEST, HTML_FILE_NAME);
const PATH_TO_FILES = path.join(DIR_TO_RUN_TEST, DIR_NAME_TO_FILES);
const PATH_TO_PNG = path.join(PATH_TO_FILES, PNG_FILENAME);

const FIXTURE_HTML_PATH_AFTER = getFixturePath('savedExample.html');
const FIXTURE_HTML_PATH_BEFORE = getFixturePath('example.html');
const FIXTURE_PNG_PATH = getFixturePath('nodejs.png');
const FIXTURE_JPG_PATH = getFixturePath('javascript.jpg');

const CONTENT_TYPE_PNG = { 'Content-Type': 'image/png' };
const CONTENT_TYPE_JPG = { 'Content-Type': 'image/jpg' };
const CONTENT_TYPE_HTML = { 'Content-Type': 'text/html' };

let fixtureHtmlContent;
let fixtureImgContent;

beforeAll(async () => {
  nock.disableNetConnect();
  await fs.mkdir(DIR_TO_RUN_TEST);
  fixtureHtmlContent = await fs.readFile(FIXTURE_HTML_PATH_AFTER, encodeUTF8);
  fixtureImgContent = await fs.readFile(FIXTURE_PNG_PATH, encodeUTF8);
});

afterAll(async () => {
  await fs.rmdir(DIR_TO_RUN_TEST, { recursive: true }).catch(noop);
  nock.cleanAll();
  nock.enableNetConnect();
});

afterEach(async () => {
  await fs.unlink(PATH_TO_HTML).catch(noop);
});

describe('pageLoader', () => {
  test('Load and save html page to define directory', async () => {
    const mainReq = nock(TEST_URL)
      .get('')
      .replyWithFile(200, FIXTURE_HTML_PATH_BEFORE, CONTENT_TYPE_HTML);

    const pngReq = nock(PNG_URL)
      .get('')
      .replyWithFile(200, FIXTURE_PNG_PATH, CONTENT_TYPE_PNG);

    const jpgReq = nock(JPG_URL)
      .get('')
      .replyWithFile(200, FIXTURE_JPG_PATH, CONTENT_TYPE_JPG);

    const result = await pageLoader(TEST_URL, DIR_TO_RUN_TEST);

    expect(result).toEqual({ filepath: PATH_TO_HTML });
    expect(mainReq.isDone()).toBeTruthy();
    expect(isExists(PATH_TO_HTML)).toBeTruthy();
    expect(await fs.readFile(PATH_TO_HTML, encodeUTF8)).toEqual(fixtureHtmlContent);

    expect(pngReq.isDone()).toBeTruthy();
    expect(jpgReq.isDone()).toBeTruthy();
    expect(isExists(PATH_TO_FILES)).toBeTruthy();
    expect(await fs.readFile(PATH_TO_PNG, encodeUTF8)).toEqual(fixtureImgContent);
  });
});
