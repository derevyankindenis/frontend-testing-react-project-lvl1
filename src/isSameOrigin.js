export default function isSameOrigin(firstUrl, secondUrl) {
  return new URL(firstUrl)?.origin === new URL(secondUrl)?.origin;
}
