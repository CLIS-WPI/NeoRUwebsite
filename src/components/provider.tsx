import { navigate } from 'astro:transitions/client';
import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import SearchDialog from '@/components/search';

export interface ProviderProps {
  /** `Astro.url.pathname` */
  pathname: string;
  /** `Astro.params` */
  params: Record<string, string | undefined>;
  children?: ReactNode;
}

function navigateWithTrailingSlash(href: string) {
  if (href.startsWith('/')) {
    const [pathAndQuery, hash] = href.split('#');
    const [path, query] = pathAndQuery.split('?');
    if (path && !path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) {
      const normalized = `${path}/${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
      return navigate(normalized);
    }
  }
  return navigate(href);
}

export function Provider({ pathname, params, children }: ProviderProps) {
  return (
    <RootProvider
      pathname={pathname}
      params={params}
      navigate={navigateWithTrailingSlash}
      search={{ SearchDialog }}
    >
      {children}
    </RootProvider>
  );
}
