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
const CSS_URL = 'https://example.com/page/style.css';
const JS_URL = 'https://example.com/page/script.js';
const DIR_TO_RUN_TEST = mkDirToRunTests();

const HTML_FILE_NAME = 'example-com-page.html';
const PNG_FILENAME = 'file_1.png';
const CSS_FILENAME = 'file_3.css';
const JS_FILENAME = 'file_4.js';
const DIR_NAME_TO_FILES = 'example-com-page_files';
const PATH_TO_HTML = path.join(DIR_TO_RUN_TEST, HTML_FILE_NAME);
const PATH_TO_FILES = path.join(DIR_TO_RUN_TEST, DIR_NAME_TO_FILES);
const PATH_TO_PNG = path.join(PATH_TO_FILES, PNG_FILENAME);
const PATH_TO_CSS = path.join(PATH_TO_FILES, CSS_FILENAME);
const PATH_TO_JS = path.join(PATH_TO_FILES, JS_FILENAME);

const FIXTURE_HTML_PATH_AFTER = getFixturePath('savedExample.html');
const FIXTURE_HTML_PATH_BEFORE = getFixturePath('example.html');
const FIXTURE_PNG_PATH = getFixturePath('nodejs.png');
const FIXTURE_JPG_PATH = getFixturePath('javascript.jpg');
const FIXTURE_CSS_PATH = getFixturePath('style.css');
const FIXTURE_JS_PATH = getFixturePath('script.js');

const CONTENT_TYPE_PNG = { 'Content-Type': 'image/png' };
const CONTENT_TYPE_JPG = { 'Content-Type': 'image/jpg' };
const CONTENT_TYPE_HTML = { 'Content-Type': 'text/html' };
const CONTENT_TYPE_CSS = { 'Content-Type': 'text/css' };
const CONTENT_TYPE_JS = { 'Content-Type': 'application/javascript' };

let fixtureHtmlContent;
let fixtureImgContent;
let fixtureCssContent;
let fistureJSContent;

beforeAll(async () => {
  nock.disableNetConnect();
  await fs.mkdir(DIR_TO_RUN_TEST);
  fixtureHtmlContent = await fs.readFile(FIXTURE_HTML_PATH_AFTER, encodeUTF8);
  fixtureImgContent = await fs.readFile(FIXTURE_PNG_PATH, encodeUTF8);
  fixtureCssContent = await fs.readFile(FIXTURE_CSS_PATH, encodeUTF8);
  fistureJSContent = await fs.readFile(FIXTURE_JS_PATH, encodeUTF8);
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

    const cssReq = nock(CSS_URL)
      .get('')
      .replyWithFile(200, FIXTURE_CSS_PATH, CONTENT_TYPE_CSS);

    const jsReq = nock(JS_URL)
      .get('')
      .replyWithFile(200, FIXTURE_JS_PATH, CONTENT_TYPE_JS);

    const result = await pageLoader(TEST_URL, DIR_TO_RUN_TEST);

    expect(result).toEqual({ filepath: PATH_TO_HTML });
    expect(mainReq.isDone()).toBeTruthy();
    expect(isExists(PATH_TO_HTML)).toBeTruthy();
    expect(await fs.readFile(PATH_TO_HTML, encodeUTF8)).toEqual(fixtureHtmlContent);

    expect(pngReq.isDone()).toBeTruthy();
    expect(jpgReq.isDone()).toBeTruthy();
    expect(isExists(PATH_TO_FILES)).toBeTruthy();
    expect(await fs.readFile(PATH_TO_PNG, encodeUTF8)).toEqual(fixtureImgContent);

    expect(cssReq.isDone()).toBeTruthy();
    expect(await fs.readFile(PATH_TO_CSS, encodeUTF8)).toEqual(fixtureCssContent);

    expect(jsReq.isDone()).toBeTruthy();
    expect(await fs.readFile(PATH_TO_JS, encodeUTF8)).toEqual(fistureJSContent);
  });
});
