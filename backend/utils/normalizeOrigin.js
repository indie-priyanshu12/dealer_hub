// Guards against the two most common ways a hand-typed dashboard env var
// (e.g. Render's CLIENT_URL) ends up malformed: missing the scheme, which
// makes the Access-Control-Allow-Origin header invalid and gets the response
// rejected by the browser outright; and a trailing slash, which the browser's
// Origin header never has, so it would otherwise silently fail to match.
export const normalizeOrigin = (url) => {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withScheme.replace(/\/+$/, '');
};
