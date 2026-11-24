export const siteName = 'NeoRU';
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${base}/${clean ? `${clean}/` : ''}`;
}
