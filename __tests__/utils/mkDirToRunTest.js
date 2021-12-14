import os from 'os';
import path from 'path';

export default function mkDirToRunTests() {
  return path.join(os.tmpdir(), `jest-test-${new Date().getTime()}`);
}
