export type ItemDeepLink = {
  itemId: string;
};

export function parseItemDeepLink(url: string | null | undefined): ItemDeepLink | null {
  if (!url) return null;

  const rawPath = /^https?:\/\//i.test(url)
    ? new URL(url).pathname
    : url.replace(/^[a-z][a-z\d+.-]*:\/\//i, '');
  const path = rawPath
    .split(/[?#]/, 1)[0]
    .replace(/^\/--\//, '/')
    .replace(/^\/+/, '');
  const match = /^item\/([^/]+)$/.exec(path);
  if (!match) return null;

  const itemId = decodeURIComponent(match[1]);
  return itemId ? { itemId } : null;
}
