import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Callout as FdCallout } from 'fumadocs-ui/components/callout';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { DocsBody } from 'fumadocs-ui/layouts/docs/page';
import type { ComponentProps } from 'react';
import type { MDXComponents } from 'mdx/types';
import * as blocks from '@/components/docs-blocks';

function Callout({ className, ...props }: ComponentProps<typeof FdCallout>) {
  return <FdCallout {...props} className={['nr-callout', className].filter(Boolean).join(' ')} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Callout,
    Step,
    Steps,
    ...blocks,
    ...components,
  } satisfies MDXComponents;
}

export default getMDXComponents({ wrapper: DocsBody });
