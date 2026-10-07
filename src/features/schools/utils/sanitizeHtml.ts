const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'A', 'IMG', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'HR', 'SPAN', 'DIV']);
function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined' || !html) return '';
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script,style,iframe,object,embed,form,svg,math').forEach((node) => node.remove());
  const all = [...document.body.querySelectorAll('*')];
  all.reverse().forEach((element) => {
    if (!allowedTags.has(element.tagName)) { element.replaceWith(...element.childNodes); return; }
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const allowed = element.tagName === 'A' ? ['href', 'target', 'rel'].includes(name)
        : element.tagName === 'IMG' ? ['src', 'alt', 'title', 'width', 'height'].includes(name) : false;
      if (!allowed) element.removeAttribute(attribute.name);
    });
    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || '';
      if (!/^(https?:|mailto:)/i.test(href)) element.removeAttribute('href');
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    }
    if (element.tagName === 'IMG') {
      const src = element.getAttribute('src') || '';
      if (!/^(https?:\/\/|data:image\/(?:png|jpeg|gif|webp);base64,)/i.test(src)) {
        element.remove();
      } else {
        element.setAttribute('loading', 'lazy');
        element.setAttribute('decoding', 'async');
      }
    }
  });
  return document.body.innerHTML;
}

export { sanitizeHtml };
