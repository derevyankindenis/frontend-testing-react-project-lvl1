import urlToName from '../src/urlToName';

test('Making file name', () => {
  expect(urlToName('https://ru.hexlet.io/courses')).toEqual('ru-hexlet-io-courses');
});
