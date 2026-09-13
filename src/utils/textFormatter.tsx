import React from 'react';

/**
 * Parses and formats text with support for:
 * 1. Strikethrough: ~~text~~ or ~text~ or <s>text</s> or <del>text</del> or <strike>text</strike>
 * 2. Bold: **text** or <b>text</b> or <strong>text</strong>
 * 3. Italic: *text* or _text_ or <i>text</i> or <em>text</em>
 * 4. Sparkle: ✦ (rendered in accent color #C89398)
 * 5. Preserves newlines and spaces
 */
export const renderFormattedText = (
  text: string | undefined | null,
  sparkleColor: string = '#C89398'
): React.ReactNode => {
  if (!text) return null;

  // Tokenize formatted segments
  const tokenRegex = /(<s>[\s\S]*?<\/s>|<del>[\s\S]*?<\/del>|<strike>[\s\S]*?<\/strike>|~~[\s\S]+?~~|~[^\s~][^~\n]*?[^\s~]~|~[^\s~]~|<b>[\s\S]*?<\/b>|<strong>[\s\S]*?<\/strong>|\*\*[^*]+?\*\*|<i>[\s\S]*?<\/i>|<em>[\s\S]*?<\/em>|\*[^*]+?\*|_[^_]+?_)/g;

  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Strikethrough HTML <s>, <del>, <strike>
    if (
      (part.startsWith('<s>') && part.endsWith('</s>')) ||
      (part.startsWith('<del>') && part.endsWith('</del>')) ||
      (part.startsWith('<strike>') && part.endsWith('</strike>'))
    ) {
      const inner = part.replace(/^<(s|del|strike)>/, '').replace(/<\/(s|del|strike)>$/, '');
      return (
        <del key={index} className="line-through decoration-[#442F2A]/60 opacity-80">
          {renderFormattedText(inner, sparkleColor)}
        </del>
      );
    }

    // 2. Strikethrough Markdown ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <del key={index} className="line-through decoration-[#442F2A]/60 opacity-80">
          {renderFormattedText(inner, sparkleColor)}
        </del>
      );
    }

    // 3. Strikethrough Markdown single ~text~
    if (part.startsWith('~') && part.endsWith('~') && !part.startsWith('~~') && part.length >= 3) {
      const inner = part.slice(1, -1);
      return (
        <del key={index} className="line-through decoration-[#442F2A]/60 opacity-80">
          {renderFormattedText(inner, sparkleColor)}
        </del>
      );
    }

    // 4. Bold HTML
    if (
      (part.startsWith('<b>') && part.endsWith('</b>')) ||
      (part.startsWith('<strong>') && part.endsWith('</strong>'))
    ) {
      const inner = part.replace(/^<(b|strong)>/, '').replace(/<\/(b|strong)>$/, '');
      return (
        <strong key={index} className="font-bold">
          {renderFormattedText(inner, sparkleColor)}
        </strong>
      );
    }

    // 5. Bold Markdown **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold">
          {renderFormattedText(inner, sparkleColor)}
        </strong>
      );
    }

    // 6. Italic HTML <i> or <em>
    if (
      (part.startsWith('<i>') && part.endsWith('</i>')) ||
      (part.startsWith('<em>') && part.endsWith('</em>'))
    ) {
      const inner = part.replace(/^<(i|em)>/, '').replace(/<\/(i|em)>$/, '');
      return (
        <em key={index} className="italic inline-block font-normal">
          {renderFormattedText(inner, sparkleColor)}
        </em>
      );
    }

    // 7. Italic Markdown *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic inline-block font-normal">
          {renderFormattedText(inner, sparkleColor)}
        </em>
      );
    }

    // 8. Italic Markdown _text_
    if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic inline-block font-normal">
          {renderFormattedText(inner, sparkleColor)}
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
                <span
                  className={
                    sparkleColor === '#442F2A'
                      ? 'text-[#442F2A] font-bold'
                      : 'text-[#C89398] font-bold'
                  }
                >
                  ✦
                </span>
              )}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};
