const dangerousBlockTags = /<(script|style|iframe|object|embed|meta|link)[^>]*>[\s\S]*?<\/\1>/gi;
const dangerousSingleTags = /<(script|style|iframe|object|embed|meta|link)[^>]*\/?>/gi;
const eventHandlers = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const javascriptProtocol = /(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi;
const dataHtmlProtocol = /(href|src)\s*=\s*(['"])\s*data:text\/html[^'"]*\2/gi;

export function sanitizeBlogHtml(value: string) {
  return value
    .replace(dangerousBlockTags, '')
    .replace(dangerousSingleTags, '')
    .replace(eventHandlers, '')
    .replace(javascriptProtocol, '$1="#"')
    .replace(dataHtmlProtocol, '$1="#"')
    .trim();
}

export function stripHtmlToText(value: string) {
  return sanitizeBlogHtml(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|blockquote|h1|h2|h3|h4|h5|h6)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function normalizeBlogBodyMarkup(value: string) {
  const sanitized = sanitizeBlogHtml(value);

  if (!sanitized) {
    return '';
  }

  if (/<[a-z][\s\S]*>/i.test(sanitized)) {
    return sanitized;
  }

  return sanitized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

export function getBlogBodyExcerpt(value: string, maxLength = 180) {
  const plain = stripHtmlToText(value);

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trimEnd()}...`;
}
