'use client';
import katex from 'katex';
import {useMemo} from 'react';

/** KaTeX-rendered mathematics (local fonts, no CDN). */
export function Tex({children, block = false}: {children: string; block?: boolean}) {
  const html = useMemo(() => katex.renderToString(children, {throwOnError: false, displayMode: block, output: 'htmlAndMathml'}), [children, block]);
  return <span className={block ? 'u-tex block' : 'u-tex'} dangerouslySetInnerHTML={{__html: html}}/>;
}
