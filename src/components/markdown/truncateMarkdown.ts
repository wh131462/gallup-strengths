const UNCLOSED_INLINE = ['**', '__', '*', '_', '`'];

function hasUnclosedInline(text: string): boolean {
  for (const token of UNCLOSED_INLINE) {
    const escaped = token.replace(/([*_`])/g, '\\$1');
    const re = new RegExp(escaped, 'g');
    const count = (text.match(re) ?? []).length;
    if (count % 2 !== 0) return true;
  }
  return false;
}

export function truncateMarkdown(text: string, maxChars: number): string {
  if (!text) return '';
  if (text.length <= maxChars) return text;

  const paragraphs = text.split(/\n\n+/);
  const parts: string[] = [];
  let length = 0;
  for (const p of paragraphs) {
    if (!p.trim()) continue;
    const nextLen = length + (length === 0 ? p.length : p.length + 2);
    if (parts.length > 0 && nextLen > maxChars) break;
    parts.push(p);
    length = nextLen;
    if (length >= maxChars) break;
  }

  let excerpt = parts.join('\n\n').trim();

  if (hasUnclosedInline(excerpt)) {
    const lines = excerpt.split('\n');
    while (lines.length > 1 && hasUnclosedInline(lines.join('\n'))) {
      lines.pop();
    }
    excerpt = lines.join('\n').trim();
  }

  if (excerpt.length < text.length) {
    excerpt = `${excerpt}\n\n…`;
  }

  return excerpt;
}
