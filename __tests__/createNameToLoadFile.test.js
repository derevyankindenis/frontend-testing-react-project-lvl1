import createNameToLoadFile from '../src/createNameToLoadFile';

describe('createNameToLoadFile', () => {
  //TODO: некорректно
  test('should return valid name to global resources', () => {
    const fileInfo = {
      fullUrl:
        'https://cdn2.hexlet.io/derivations/image/fill_webp/540/320/file?width=520,height=540',
      url: 'https://cdn2.hexlet.io/derivations/image/fill_webp/540/320/file?width=520,height=540',
      baseUrl: 'https://example.com/page',
      file: 'content',
      ext: 'webp',
    };
    const name = createNameToLoadFile(fileInfo);
    expect(name).toEqual('file.webp');
  });

  //TODO: некорректно
  test('should return valid name to global resources with file extension', () => {
    const fileInfo = {
      fullUrl: 'https://cdn2.hexlet.io/file.webp',
      url: 'https://cdn2.hexlet.io/file.webp',
      baseUrl: 'https://example.com/page',
      file: 'content',
      ext: 'webp',
    };
    const name = createNameToLoadFile(fileInfo);
    expect(name).toEqual('file.webp');
  });

  test('should return valid name to local resources by full url', () => {
    const fileInfo = {
      url: 'https://example.com/page/sys/col/img/file.png',
      fullUrl: 'https://example.com/page/sys/col/img/file.png',
      baseUrl: 'https://example.com/page',
      file: 'pngContent',
      ext: 'png',
    };
    const name = createNameToLoadFile(fileInfo);
    expect(name).toEqual('example-com-page-sys-col-img-file.png');
  });

  test('should return valid name to local resources by relative url with path', () => {
    const fileInfo = {
      url: '/page/blog/sys/col/img/file.png',
      fullUrl: 'https://example.com/sys/col/img/file.png',
      baseUrl: 'https://example.com/page/blog/',
      file: 'pngContent',
      ext: 'png',
    };
    const name = createNameToLoadFile(fileInfo);
    expect(name).toEqual('example-com-sys-col-img-file.png');
  });

  test('should return valid name to local resources by relative url without path', () => {
    const fileInfo = {
      url: 'file.png',
      fullUrl: 'https://example.com/file.png',
      baseUrl: 'https://example.com/page/blog/',
      file: 'pngContent',
      ext: 'png',
    };
    const name = createNameToLoadFile(fileInfo);
    expect(name).toEqual('example-com-file.png');
  });
});
