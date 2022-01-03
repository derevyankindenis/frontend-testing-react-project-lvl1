import ExtendedURL from "../src/ExtendedURL";

describe("ExtendedURL tests", () => {
  test("toFileName", () => {
    const url1 = new ExtendedURL("https://site.com/assets/scripts.js");
    expect(url1.toFileName()).toEqual("site-com-assets-scripts.js");

    const url2 = new ExtendedURL("https://site.com/blog/about//");
    expect(url2.toFileName()).toEqual("site-com-blog-about.html");
  });

  test("isGlobal", () => {
    const url1 = new ExtendedURL("https://site.com/assets/scripts.js");
    expect(url1.isGlobal).not.toBeTruthy();

    const url2 = new ExtendedURL(
      "https://site.com/assets/scripts.js",
      "https://site.com"
    );

    expect(url2.isGlobal).not.toBeTruthy();

    const url3 = new ExtendedURL(
      "https://cdn2.site.com/blog/assets/style.css",
      "https://site.com"
    );

    expect(url3.isGlobal).toBeTruthy();
  });

  test("get extension", () => {
    const url1 = new ExtendedURL("https://site.com/assets/scripts.js");
    expect(url1.extension).toEqual("js");

    const url2 = new ExtendedURL("https://site.com/assets");
    expect(url2.extension).toEqual(undefined);
  });
});
