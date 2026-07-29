import { normalizeOrigin } from '../utils/normalizeOrigin.js';

describe('normalizeOrigin', () => {
  it('returns undefined for undefined, empty, or whitespace-only input', () => {
    expect(normalizeOrigin(undefined)).toBeUndefined();
    expect(normalizeOrigin('')).toBeUndefined();
    expect(normalizeOrigin('   ')).toBeUndefined();
  });

  it('adds an https:// scheme when none is present', () => {
    expect(normalizeOrigin('dealer-hub-alpha.vercel.app')).toBe('https://dealer-hub-alpha.vercel.app');
  });

  it('leaves an already-https:// origin unchanged', () => {
    expect(normalizeOrigin('https://dealer-hub-alpha.vercel.app')).toBe('https://dealer-hub-alpha.vercel.app');
  });

  it('does not override an explicit http:// scheme', () => {
    expect(normalizeOrigin('http://localhost:5173')).toBe('http://localhost:5173');
  });

  it('trims surrounding whitespace (a common copy-paste artifact in dashboard env vars)', () => {
    expect(normalizeOrigin('  dealer-hub-alpha.vercel.app  ')).toBe('https://dealer-hub-alpha.vercel.app');
  });

  it('strips a trailing slash, since the browser Origin header never includes one', () => {
    expect(normalizeOrigin('https://dealer-hub-alpha.vercel.app/')).toBe('https://dealer-hub-alpha.vercel.app');
  });
});
