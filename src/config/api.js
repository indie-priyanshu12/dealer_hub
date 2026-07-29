// In dev, Vite's server.proxy in vite.config.js forwards relative /api calls to
// the local backend — that proxy does not exist in a production build, so a
// deployed frontend (e.g. Vercel) needs an absolute URL to a deployed backend
// (e.g. Render), supplied via VITE_API_BASE_URL. Left unset, this stays ''
// and every call remains relative, preserving today's local-dev behavior.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
