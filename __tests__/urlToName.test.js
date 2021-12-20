import urlToName from '../src/urlToName';

describe('Making file name', () => {
  test('witout slash ending', () => {
    expect(urlToName('https://ru.hexlet.io/courses')).toEqual('ru-hexlet-io-courses');
  });
  test('with slash ending', () => {
    expect(urlToName('https://ru.hexlet.io/courses/')).toEqual('ru-hexlet-io-courses');
  });
});
