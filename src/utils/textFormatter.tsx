import React from 'react';

/**
 * Parses and formats text with support for:
 * 1. Bold: **text** or <b>text</b> or <strong>text</strong>
 * 2. Italic: *text* or _text_ or <i>text</i> or <em>text</em>
 * 3. Preserves newlines and spaces
 */
export const renderFormattedText = (text: string | undefined | null): React.ReactNode => {
  if (!text) return null;

  // Tokenize formatted segments
  const tokenRegex = /(<b>[\s\S]*?<\/b>|<strong>[\s\S]*?<\/strong>|<i>[\s\S]*?<\/i>|<em>[\s\S]*?<\/em>|\*\*[^*]+?\*\*|\*[^*]+?\*|_[^_]+?_)/g;

  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Bold HTML
    if (
      (part.startsWith('<b>') && part.endsWith('</b>')) ||
      (part.startsWith('<strong>') && part.endsWith('</strong>'))
    ) {
      const inner = part.replace(/^<(b|strong)>/, '').replace(/<\/(b|strong)>$/, '');
      return (
        <strong key={index} className="font-bold">
          {inner}
        </strong>
      );
    }

    // 2. Bold Markdown **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold">
          {inner}
        </strong>
      );
    }

    // 3. Italic HTML <i> or <em>
    if (
      (part.startsWith('<i>') && part.endsWith('</i>')) ||
      (part.startsWith('<em>') && part.endsWith('</em>'))
    ) {
      const inner = part.replace(/^<(i|em)>/, '').replace(/<\/(i|em)>$/, '');
      return (
        <em key={index} className="italic inline-block font-normal">
          {inner}
        </em>
      );
    }

    // 4. Italic Markdown *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic inline-block font-normal">
          {inner}
        </em>
      );
    }

    // 5. Italic Markdown _text_
    if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic inline-block font-normal">
          {inner}
        </em>
      );
    }

    if (part.includes('✦')) {
      const subParts = part.split('✦');
      return (
        <React.Fragment key={index}>
          {subParts.map((sub, sIdx) => (
            <React.Fragment key={sIdx}>
              {sub}
              {sIdx < subParts.length - 1 && (
                <span className="text-[#C89398] font-bold">✦</span>
              )}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};
