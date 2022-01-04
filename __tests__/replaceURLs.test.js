import fs from "fs/promises";
import { getFixturePath, encode } from "./testUtils";
import replaceURLs from "../src/replaceURLs";

const HTML_BEFORE_PATH = getFixturePath("site-com-blog-about.html");
const HTML_AFTER_PATH = getFixturePath("expected/site-com-blog-about.html");

const REPLACES = {
  "/blog/about/assets/styles.css":
    "site-com-blog-about_files/site-com-blog-about-assets-styles.css",
  "/blog/about": "site-com-blog-about_files/site-com-blog-about.html",
  "/photos/me.jpg": "site-com-blog-about_files/site-com-photos-me.jpg",
  "/photos/me2.jpg": "site-com-blog-about_files/site-com-photos-me2.jpg",
  "https://site.com/assets/scripts.js":
    "site-com-blog-about_files/site-com-assets-scripts.js",
};

const replacer = (url) => REPLACES[url];

test("replaceURLs", async () => {
  const HTMLBefore = await fs.readFile(HTML_BEFORE_PATH, encode);
  const expectedHTML = await fs.readFile(HTML_AFTER_PATH, encode);
  const resultHTML = replaceURLs(HTMLBefore, replacer);
  expect(resultHTML.trim()).toEqual(expectedHTML.trim());
});
