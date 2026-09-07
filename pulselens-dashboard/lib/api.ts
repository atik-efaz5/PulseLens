/** Same-origin API paths — proxied to backend via next.config.mjs rewrites */
export function apiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.startsWith('/api/') ? normalized : `/api${normalized}`;
}
