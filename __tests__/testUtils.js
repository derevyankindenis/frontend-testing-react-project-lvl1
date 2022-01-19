import path from 'path';
import os from 'os';

export const encode = { encoding: 'utf-8' };

export function getFixturePath(filename) {
  return path.join(__dirname, '../__tests__/__fixtures__', filename);
}

export function generatePathToRunTests() {
  return path.join(os.tmpdir(), `jest-test-${new Date().getTime()}`);
}

export function noop() {}
