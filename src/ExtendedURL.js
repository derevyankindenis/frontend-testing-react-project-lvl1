import { trimSlash } from "./utils";

export default class ExtendedURL extends URL {
  constructor(url, base) {
    super(url, base);
    if (base) {
      this.base = new URL(base);
    }
    this.url = url;
  }

  toFileName() {
    const [path, ext] = this.pathname.split(".");
    const witouhProtocol = [this.hostname, path].join("");
    const trimmedStr = trimSlash(witouhProtocol);
    const validFileName = trimmedStr.replace(/\W/gi, "-");
    return [validFileName, ext || "html"].join(".");
  }

  get isGlobal() {
    return this.base ? this.origin !== this.base.origin : false;
  }

  get extension() {
    const [, ext] = this.pathname.split(".");
    return ext;
  }

  static isValidURL(url) {
    try {
      // eslint-disable-next-line no-new
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
