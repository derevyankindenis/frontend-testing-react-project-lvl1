import isAbsoluteURL from '../src/isAbsoluteURL';

describe('isAbsoluteURL', () => {
  test('return true for absolute URLs', () => {
    expect(isAbsoluteURL('https://example.com/page')).toBeTruthy();
    expect(isAbsoluteURL('//local/file/saver')).toBeTruthy();
  });

  test('return false for relative URLs', () => {
    expect(isAbsoluteURL('./example/page')).not.toBeTruthy();
    expect(isAbsoluteURL('node.js')).not.toBeTruthy();
  });
});
