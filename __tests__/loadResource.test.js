import nock from 'nock';
import fs from 'fs/promises';
import path from 'path';
import mkDirToRunTests from './utils/mkDirToRunTest';
import getFixturePath from './utils/getFixtures';
import noop from './utils/noop';
import encodeUTF8 from './utils/encodeUTF8';
import loadResource from '../src/loadResource';
import isExists from '../src/isExists';

const DIR_TO_RUN_TEST = mkDirToRunTests();
const URL_TO_RESOURCE = 'https://example.com/page/nodejs.png';
const PATH_TO_IMG_FIXTURE = getFixturePath('nodejs.png');
const PATH_TO_SAVED_IMG = path.join(DIR_TO_RUN_TEST, 'nodejs.png');
const PNG_CONTENT_TYPE = { 'Content-Type': 'image/png' };

beforeAll(async () => {
  nock.disableNetConnect();
  await fs.mkdir(DIR_TO_RUN_TEST);
});

afterAll(async () => {
  await fs.rmdir(DIR_TO_RUN_TEST, { recursive: true }).catch(noop);
  nock.cleanAll();
  nock.enableNetConnect();
});

test('loadResource', async () => {
  const request = nock(URL_TO_RESOURCE)
    .get('')
    .replyWithFile(200, PATH_TO_IMG_FIXTURE, PNG_CONTENT_TYPE);

  await loadResource(URL_TO_RESOURCE, PATH_TO_SAVED_IMG);

  expect(request.isDone()).toBeTruthy();
  expect(isExists(PATH_TO_SAVED_IMG)).toBeTruthy();

  const fixtureImg = await fs.readFile(PATH_TO_IMG_FIXTURE, encodeUTF8);
  const resultImg = await fs.readFile(PATH_TO_SAVED_IMG, encodeUTF8);
  expect(resultImg).toEqual(fixtureImg);
});
