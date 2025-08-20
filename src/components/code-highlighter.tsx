'use client';

import { useEffect, useRef } from 'react';
import hljs from 'highlight.js';

interface CodeHighlighterProps {
  content: string;
  language: string;
}

export function CodeHighlighter({ content, language }: CodeHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      if (language && hljs.getLanguage(language)) {
        hljs.highlightElement(codeRef.current);
      }
    }
  }, [content, language]);

  return (
    <pre className="bg-black/50 p-4 rounded-md overflow-x-auto text-sm font-code">
      <code ref={codeRef} className={language}>
        {content}
      </code>
    </pre>
  );
}
