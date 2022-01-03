import fs from "fs/promises";
import path from "path";
import nock from "nock";
import loadAndSave from "../src/loadAndSave";
import { getFixturePath, generatePathToRunTests, noop, encode } from "./testUtils";
import isExists from "../src/isExists";
import { FileCantBeSavedError, FileCantBeLoadedError } from "../src/Errors";

const FILE_NAME = "site-com-blog-about.html";
const FIXTURE_FILE_PATH = getFixturePath(FILE_NAME);
const DIR_TO_RUN_TEST = generatePathToRunTests();
const URL = "https://example.com/";

beforeAll(async () => {
  nock.disableNetConnect();
  await fs.mkdir(DIR_TO_RUN_TEST);
});

afterAll(async () => {
  await fs.rm(DIR_TO_RUN_TEST, { recursive: true }).catch(noop);
  nock.cleanAll();
  nock.enableNetConnect();
});

describe("loadAndSave", () => {
  test("load and save file", async () => {
    const scope = nock(URL)
      .get("/")
      .replyWithFile(200, FIXTURE_FILE_PATH, { "Content-Type": "text/html" });
    let hasBeebCalled = false;
    const onSaveCallback = jest.fn((s) => {
      hasBeebCalled = true;
      return s;
    });
    const pathToFile = path.join(DIR_TO_RUN_TEST, FILE_NAME);
    await loadAndSave(URL, pathToFile, onSaveCallback);
    const expectedFile = await fs.readFile(FIXTURE_FILE_PATH, encode);
    const savedFile = await fs.readFile(pathToFile, encode);
    expect(scope.isDone()).toBeTruthy();
    expect(isExists(pathToFile)).toBeTruthy();
    expect(savedFile).toEqual(expectedFile);
    expect(hasBeebCalled).toBeTruthy();
  });

  test("throw error, if file can't be loaded", async () => {
    expect.assertions(1);
    nock(URL).get("/").reply(404);
    await expect(loadAndSave(URL, DIR_TO_RUN_TEST, FILE_NAME, (s) => s)).rejects.toThrow(
      FileCantBeLoadedError
    );
  });

  test("throw error, if file can't be saved", async () => {
    expect.assertions(1);
    const mk = async () => Promise.reject(new Error("ERROR"));
    const origWriteFile = fs.writeFile;
    fs.writeFile = mk;
    nock(URL)
      .get("/")
      .replyWithFile(200, FIXTURE_FILE_PATH, { "Content-Type": "text/html" });
    const pathToFile = path.join(DIR_TO_RUN_TEST, FILE_NAME);
    await expect(loadAndSave(URL, pathToFile, (s) => s)).rejects.toThrow(
      FileCantBeSavedError
    );

    fs.writeFile = origWriteFile;
  });
});
