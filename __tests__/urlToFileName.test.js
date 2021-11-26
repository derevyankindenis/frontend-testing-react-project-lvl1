import urlToFileName from '../src/urlToFileName';

test('Making file name', () => {
  expect(urlToFileName('https://ru.hexlet.io/courses')).toEqual(
    'ru-hexlet-io-courses.html',
  );
});
