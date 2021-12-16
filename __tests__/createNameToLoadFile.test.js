import createNameToLoadFile from '../src/createNameToLoadFile';

describe('createNameToLoadFile', () => {
  test('with url without extension', () => {
    const fileInfo = {
      url: 'https://cdn2.hexlet.io/derivations/image/fill_webp/540/320/file?width=520,height=540',
      file: 'webpContent',
      ext: 'webp',
    };
    const name = createNameToLoadFile(fileInfo);
    expect(name).toEqual('file.webp');
  });
  test('with url with extension', () => {
    const fileInfo = {
      url: 'https://cdn2.hexlet.io/assets/professions/file.png',
      file: 'pngContent',
      ext: 'png',
    };
    const name = createNameToLoadFile(fileInfo);
    expect(name).toEqual('file.png');
  });
});
