import replaceURLs from "./replaceURLs";
import useReplacer from "./useReplacer";

export default function useTransformHTML(baseURL, pathToSaveFiles) {
  const [urls, replacer] = useReplacer(baseURL, pathToSaveFiles);
  const transform = (HTML) => replaceURLs(HTML, replacer);
  return [urls, transform];
}
