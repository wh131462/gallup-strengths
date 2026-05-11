import { useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Variant = 'card' | 'reader';

interface Props {
  children: string;
  variant?: Variant;
  className?: string;
}

// CommonMark 的 emphasis 规则要求 `**` 满足 left/right-flanking，
// 当 `**` 紧贴 CJK 字符或中文标点（如 “”、《》）时，flanking 判定失败，
// 导致 `**...**` 被原样输出。在 `**` 内侧注入 ZWSP 可恢复识别。
const ZWSP = '​';
const CJK_OR_PUNCT = /[　-〿一-鿿＀-￯‘’“”—…]/;

function fixCjkEmphasis(input: string): string {
  return input
    .replace(/\*\*([^*\n]+?)\*\*/g, (match, inner: string) => {
      const first = inner.charAt(0);
      const last = inner.charAt(inner.length - 1);
      if (!CJK_OR_PUNCT.test(first) && !CJK_OR_PUNCT.test(last)) return match;
      return `**${ZWSP}${inner}${ZWSP}**`;
    })
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, (match, inner: string) => {
      const first = inner.charAt(0);
      const last = inner.charAt(inner.length - 1);
      if (!CJK_OR_PUNCT.test(first) && !CJK_OR_PUNCT.test(last)) return match;
      return `*${ZWSP}${inner}${ZWSP}*`;
    });
}

function makeComponents(variant: Variant): Components {
  const isReader = variant === 'reader';
  const body = isReader
    ? 'text-zinc-700 dark:text-zinc-300 text-[17px] leading-[1.9]'
    : 'text-zinc-600 dark:text-zinc-400 font-light text-sm leading-relaxed';

  const h1Size = isReader ? 'text-[28px]' : 'text-xl';
  const h2Size = isReader ? 'text-[22px]' : 'text-lg';
  const h3Size = isReader ? 'text-[18px]' : 'text-base';
  const blockGap = isReader ? 'my-5' : 'my-3';
  const headingGap = isReader ? 'mt-10 mb-4' : blockGap;

  const headingFont = isReader
    ? 'font-semibold tracking-tight'
    : 'font-serif italic font-light tracking-tight';

  return {
    h1: ({ children }) => (
      <h1 className={`${h1Size} ${headingFont} text-zinc-900 dark:text-white ${isReader ? headingGap : blockGap} ${isReader ? 'pb-3 border-b border-zinc-200 dark:border-zinc-800' : ''}`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`${h2Size} ${headingFont} text-zinc-900 dark:text-white ${isReader ? headingGap : blockGap}`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`${h3Size} ${headingFont} text-zinc-800 dark:text-zinc-100 ${isReader ? headingGap : blockGap}`}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={`${isReader ? 'font-semibold text-[16px]' : 'font-serif italic font-light'} text-zinc-800 dark:text-zinc-100 ${isReader ? 'mt-6 mb-3' : blockGap}`}>{children}</h4>
    ),
    p: ({ children }) => <p className={`${body} ${blockGap}`}>{children}</p>,
    strong: ({ children }) =>
      isReader ? (
        <strong className="font-semibold text-zinc-900 dark:text-white">{children}</strong>
      ) : (
        <strong className="font-medium text-zinc-900 dark:text-white">{children}</strong>
      ),
    em: ({ children }) => <em className="italic text-zinc-800 dark:text-zinc-200">{children}</em>,
    ul: ({ children }) => <ul className={`list-disc pl-6 ${isReader ? 'space-y-3' : 'space-y-2'} ${body} ${blockGap}`}>{children}</ul>,
    ol: ({ children }) => <ol className={`list-decimal pl-6 ${isReader ? 'space-y-3' : 'space-y-2'} ${body} ${blockGap}`}>{children}</ol>,
    li: ({ children }) => <li className={isReader ? 'leading-[1.9] pl-1' : 'leading-relaxed'}>{children}</li>,
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
  const source = useMemo(() => fixCjkEmphasis(children), [children]);
  return (
    <div className={className} style={{ fontFamily: 'var(--font-reading)' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
