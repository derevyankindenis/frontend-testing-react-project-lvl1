import useReplacer from "../src/useReplacer";

const BASE_URL = "https://site.com";
const ASSETS_PATH = "site-com-blog-about_files";

const URLS = [
  "https://cdn2.site.com/blog/assets/style.css",
  "/blog/about/assets/styles.css",
  "https://getbootstrap.com/docs/4.5",
  "/blog/about",
  "/photos/me.jpg",
  "https://site.com/assets/scripts.js",
];

const RESULT_URLS = {
  "https://site.com/blog/about/assets/styles.css":
    "site-com-blog-about_files/site-com-blog-about-assets-styles.css",
  "https://site.com/blog/about": "site-com-blog-about_files/site-com-blog-about.html",
  "https://site.com/photos/me.jpg": "site-com-blog-about_files/site-com-photos-me.jpg",
  "https://site.com/assets/scripts.js":
    "site-com-blog-about_files/site-com-assets-scripts.js",
};

test("useReplacer", async () => {
  const [urls, replace] = useReplacer(BASE_URL, ASSETS_PATH);
  URLS.forEach(replace);
  expect(urls).toEqual(RESULT_URLS);
});
