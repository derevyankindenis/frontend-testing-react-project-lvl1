import path from "path";
import fs from "fs/promises";
import nock from "nock";
import rimraf from "rimraf";
import pageLoader from "../src/pageLoader";
import {
  NoDirectoryToSaveError,
  InvalidURLError,
  HTMLAlreadyExistsError,
  FileCantBeLoadedError,
} from "../src/Errors";
import isExists from "../src/isExists";
import { generatePathToRunTests, noop, getFixturePath, encode } from "./testUtils";

const MAIN_URL = "https://site.com/blog/about";
const DIR_TO_RUN_TEST = generatePathToRunTests();

const DIR_NAME_TO_FILES = "site-com-blog-about_files";
const PATH_TO_FILES = path.join(DIR_TO_RUN_TEST, DIR_NAME_TO_FILES);
const HTML_FILE_NAME = "site-com-blog-about.html";
const FIXTURE_HTML_PATH_BEFORE = getFixturePath("site-com-blog-about.html");
const FIXTURE_HTML_PATH_AFTER = getFixturePath(`expected/${HTML_FILE_NAME}`);
const PATH_TO_HTML = path.join(DIR_TO_RUN_TEST, HTML_FILE_NAME);

const getExpectedAssetPath = (fileName) =>
  getFixturePath(`expected/site-com-blog-about_files/${fileName}`);

const ASSETS = [
  {
    fixturePath: getExpectedAssetPath("site-com-photos-me.jpg"),
    contentType: { "Content-Type": "image/jpeg" },
    fileName: "site-com-photos-me.jpg",
    url: "https://site.com/photos/me.jpg",
    pathAfterSave: path.join(PATH_TO_FILES, "site-com-photos-me.jpg"),
  },
  {
    fixturePath: getExpectedAssetPath("site-com-blog-about-assets-styles.css"),
    contentType: { "Content-Type": "text/css" },
    fileName: "site-com-blog-about-assets-styles.css",
    url: "https://site.com/blog/about/assets/styles.css",
    pathAfterSave: path.join(PATH_TO_FILES, "site-com-blog-about-assets-styles.css"),
  },
  {
    fixturePath: getExpectedAssetPath("site-com-assets-scripts.js"),
    contentType: { "Content-Type": "application/javascript" },
    fileName: "site-com-assets-scripts.js",
    url: "https://site.com/assets/scripts.js",
    pathAfterSave: path.join(PATH_TO_FILES, "site-com-assets-scripts.js"),
  },
  {
    fixturePath: getExpectedAssetPath("site-com-blog-about.html"),
    contentType: { "Content-Type": "text/html" },
    fileName: "site-com-blog-about.html",
    url: "https://site.com/blog/about",
    pathAfterSave: path.join(PATH_TO_FILES, "site-com-blog-about.html"),
  },
];

beforeAll(async () => {
  nock.disableNetConnect();
  await fs.mkdir(DIR_TO_RUN_TEST);
});

afterAll(async () => {
  await fs.rm(DIR_TO_RUN_TEST, { recursive: true }).catch(noop);
  nock.enableNetConnect();
});

afterEach(async () => {
  nock.cleanAll();
  await new Promise((resolve) => {
    rimraf(`${DIR_TO_RUN_TEST}/*`, () => {
      resolve();
    });
  });
});

describe("pageLoader tests", () => {
  test("correct works", async () => {
    const mainReq = nock("https://site.com")
      .get("/blog/about")
      .replyWithFile(200, FIXTURE_HTML_PATH_BEFORE, { "Content-Type": "text/html" });
    const assetsRequests = ASSETS.map((asset) =>
      nock(asset.url).get("").replyWithFile(200, asset.fixturePath, asset.contentType)
    );

    const result = await pageLoader(MAIN_URL, DIR_TO_RUN_TEST);
    expect(mainReq.isDone()).toBeTruthy();
    expect(result).toEqual({ filepath: PATH_TO_HTML });
    expect(isExists(PATH_TO_FILES)).toBeTruthy();
    const expectedHTML = await fs.readFile(FIXTURE_HTML_PATH_AFTER, encode);
    const resultHTML = await fs.readFile(PATH_TO_HTML, encode);
    expect(resultHTML.trim()).toEqual(expectedHTML.trim());

    assetsRequests.forEach((request) => {
      expect(request.isDone()).toBeTruthy();
    });

    ASSETS.forEach((asset) => expect(isExists(asset.pathAfterSave)).toBeTruthy());

    const fileContents = await Promise.all(
      ASSETS.map((asset) =>
        Promise.all([
          fs.readFile(asset.pathAfterSave, encode),
          fs.readFile(asset.fixturePath, encode),
        ]).then(([resultFile, expectedFile]) => ({ resultFile, expectedFile }))
      )
    );

    fileContents.forEach(({ resultFile, expectedFile }) =>
      expect(resultFile).toEqual(expectedFile)
    );
  });

  test("throw exeption if html can't be saved", async () => {
    expect.assertions(1);
    const notExistsDir = path.join(DIR_TO_RUN_TEST, "no-exists");
    await expect(pageLoader(MAIN_URL, notExistsDir)).rejects.toThrow(
      NoDirectoryToSaveError
    );
  });

  test("throw exeption if run with invalid url", async () => {
    expect.assertions(1);
    await expect(pageLoader("invalidURL", DIR_TO_RUN_TEST)).rejects.toThrow(
      InvalidURLError
    );
  });

  test("throw exeptions if html already exists", async () => {
    expect.assertions(1);
    const pathToHTML = path.join(DIR_TO_RUN_TEST, "site-com-blog-about.html");
    await fs.writeFile(pathToHTML, "<html></html>", "utf-8");
    await expect(pageLoader(MAIN_URL, DIR_TO_RUN_TEST)).rejects.toThrow(
      HTMLAlreadyExistsError
    );
  });

  test.each([401, 403, 404, 500, 503])(
    "throw exeption if main url doesn't avaliable, server returns %d",
    async (code) => {
      expect.assertions(1);
      nock(MAIN_URL).get("/").reply(code);
      await expect(pageLoader(MAIN_URL, DIR_TO_RUN_TEST)).rejects.toThrow(
        FileCantBeLoadedError
      );
    }
  );

  test.each([401, 403, 404, 500, 503])(
    "throw exeption if assets url doesn't avaliable, server returns %d",
    async (code) => {
      nock("https://site.com")
        .get("/blog/about")
        .replyWithFile(200, FIXTURE_HTML_PATH_BEFORE, { "Content-Type": "text/html" });
      ASSETS.map((asset) => nock(asset.url).get("").reply(code, {}));
      await expect(pageLoader(MAIN_URL, DIR_TO_RUN_TEST)).rejects.toThrow(
        FileCantBeLoadedError
      );
    }
  );
});
