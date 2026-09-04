import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function renderBody(markdown: string) {
  const headings: { id: string; text: string }[] = [];
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const plain = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
    // A stable numeric suffix avoids collisions and works for both writing systems.
    const id = `section-${headings.length + 1}`;
    if (depth === 2) headings.push({ id, text: plain });
    return `<h${Math.max(2, depth)}${depth === 2 ? ` id="${id}"` : ''}>${text}</h${Math.max(2, depth)}>`;
  };
  const html = sanitizeHtml(marked.parse(markdown, { async: false, renderer }), {
    allowedTags: ['h2', 'h3', 'h4', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre', 'hr', 'br'],
    allowedAttributes: { a: ['href', 'title'], h2: ['id'] },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
  });
  return { html, headings };
}
