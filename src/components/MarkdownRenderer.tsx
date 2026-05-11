import { useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Variant = 'card' | 'reader';

interface Props {
  children: string;
  variant?: Variant;
  className?: string;
}

function makeComponents(variant: Variant): Components {
  const body =
    variant === 'reader'
      ? 'text-zinc-700 dark:text-zinc-300 font-light text-lg leading-loose'
      : 'text-zinc-600 dark:text-zinc-400 font-light text-sm leading-relaxed';

  const h1Size = variant === 'reader' ? 'text-4xl' : 'text-xl';
  const h2Size = variant === 'reader' ? 'text-3xl' : 'text-lg';
  const h3Size = variant === 'reader' ? 'text-2xl' : 'text-base';
  const blockGap = variant === 'reader' ? 'my-6' : 'my-3';

  return {
    h1: ({ children }) => (
      <h1 className={`${h1Size} font-serif italic font-light tracking-tight text-zinc-900 dark:text-white ${blockGap}`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`${h2Size} font-serif italic font-light tracking-tight text-zinc-900 dark:text-white ${blockGap}`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`${h3Size} font-serif italic font-light tracking-tight text-zinc-800 dark:text-zinc-100 ${blockGap}`}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={`font-serif italic font-light text-zinc-800 dark:text-zinc-100 ${blockGap}`}>{children}</h4>
    ),
    p: ({ children }) => <p className={`${body} ${blockGap}`}>{children}</p>,
    strong: ({ children }) => <strong className="font-medium text-zinc-900 dark:text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-zinc-800 dark:text-zinc-200">{children}</em>,
    ul: ({ children }) => <ul className={`list-disc pl-6 space-y-2 ${body} ${blockGap}`}>{children}</ul>,
    ol: ({ children }) => <ol className={`list-decimal pl-6 space-y-2 ${body} ${blockGap}`}>{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className={`border-l-2 border-zinc-300 dark:border-zinc-700 pl-4 italic text-zinc-600 dark:text-zinc-400 ${blockGap}`}>
        {children}
      </blockquote>
    ),
    code: ({ className: cls, children, ...rest }) => {
      const isBlock = /language-/.test(cls ?? '') || String(children).includes('\n');
      if (isBlock) {
        return (
          <code className="font-mono text-sm text-zinc-800 dark:text-zinc-200" {...rest}>
            {children}
          </code>
        );
      }
      return (
        <code
          className="font-mono text-[0.9em] bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded"
          {...rest}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className={`bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 overflow-x-auto text-sm ${blockGap}`}>
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className={`overflow-x-auto ${blockGap}`}>
        <table className="w-full text-sm border border-zinc-200 dark:border-zinc-800 border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-zinc-50 dark:bg-zinc-900/50">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-zinc-200 dark:border-zinc-800">{children}</tr>,
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-medium uppercase tracking-wider text-[11px] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 align-top">
        {children}
      </td>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 text-zinc-800 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
      >
        {children}
      </a>
    ),
    hr: () => <hr className={`border-zinc-200 dark:border-zinc-800 ${blockGap}`} />,
  };
}

export default function MarkdownRenderer({ children, variant = 'reader', className }: Props) {
  const components = useMemo(() => makeComponents(variant), [variant]);
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
