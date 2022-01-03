import cheerio from "cheerio";

const SELECTOR_TO_SRC_ATTR = {
  img: "src",
  "link[href]": "href",
  "script[src]": "src",
};

export default function replaceURLs(HTML, replacer) {
  const $ = cheerio.load(HTML);

  Object.entries(SELECTOR_TO_SRC_ATTR).forEach(([selector, attribName]) => {
    $(selector).each(function f() {
      const oldValue = $(this).attr(attribName);
      $(this).attr(attribName, replacer(oldValue) || oldValue);
    });
  });

  return $.html();
}
