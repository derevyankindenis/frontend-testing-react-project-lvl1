import { cwd } from 'process';
import path from 'path';
import pathToSave from '../src/pathToSave';

const TEST_URL = 'https://example.com/page';
const FILE_NAME = 'example-com-page.html';

describe('pathToSave', () => {
  test('Return full path by defined full path and url', () => {
    const targetPath = 'D:/tests/';
    const expectedPath = path.join(targetPath, FILE_NAME);
    expect(pathToSave(TEST_URL, targetPath)).toEqual(expectedPath);
  });

  test('Return path to current directory', () => {
    const expectedPath = path.join(cwd(), FILE_NAME);
    expect(pathToSave(TEST_URL)).toEqual(expectedPath);
  });

  test('Return full path by relative path', () => {
    const relativePath = './jest/tests';
    const expectedPath = path.join(cwd(), relativePath, FILE_NAME);
    expect(pathToSave(TEST_URL, relativePath)).toEqual(expectedPath);
  });
});
