/* eslint-disable max-classes-per-file */
export class FileCantBeLoadedError extends Error {
  constructor(url) {
    const message = `File by url "${url}" can't be loaded`;
    super(message);
  }
}

export class FileCantBeSavedError extends Error {
  constructor(fileName) {
    const message = `File "${fileName}" can't be saved`;
    super(message);
  }
}

export class HTMLAlreadyExistsError extends Error {
  constructor(htmlpath) {
    const message = `HTML "${htmlpath}" already exists`;
    super(message);
  }
}

export class NoDirectoryToSaveError extends Error {
  constructor(path) {
    const message = `Directory ${path} doesn't exsist`;
    super(message);
  }
}
