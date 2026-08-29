import React from 'react';

/**
 * A lightweight, safe Markdown renderer component that converts basic markdown
 * (headings, bold, italics, lists, blockquotes, code) into styled HTML elements.
 */
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const parseInline = (text: string): React.ReactNode[] => {
    // Bold parsing **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-on-surface">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Italic parsing *text*
      const italicParts = part.split(/(\*.*?\*)/g);
      return italicParts.map((sub, sIdx) => {
        if (sub.startsWith('*') && sub.endsWith('*')) {
          return (
            <em key={`${index}-${sIdx}`} className="italic text-on-surface font-medium">
              {sub.slice(1, -1)}
            </em>
          );
        }
        return sub;
      });
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // End list if current line is not a list item
    if (inList && !trimmed.startsWith('* ') && !trimmed.match(/^\d+\.\s/)) {
      elements.push(
        <ul key={`ul-${index}`} className="list-disc pl-6 space-y-1.5 my-3 text-on-surface-variant">
          {listItems}
        </ul>
      );
      inList = false;
      listItems = [];
    }

    if (!trimmed) {
      return;
    }

    // Headings
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="font-headline text-2xl font-bold text-on-surface mt-6 mb-3 border-b border-outline-variant/30 pb-2">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="font-headline text-lg font-bold text-on-surface mt-5 mb-2">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={index} className="font-headline text-base font-bold text-primary mt-4 mb-2">
          {parseInline(trimmed.slice(5))}
        </h4>
      );
    } else if (trimmed.startsWith('> ')) {
      // Blockquote
      elements.push(
        <blockquote key={index} className="border-l-4 border-primary pl-4 italic bg-surface-container-low p-4 rounded-r-xl text-on-surface my-4 shadow-sm">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
      // List items
      inList = true;
      const textContent = trimmed.replace(/^(\*\s+|\d+\.\s+)/, '');
      listItems.push(
        <li key={index} className="leading-relaxed">
          {parseInline(textContent)}
        </li>
      );
    } else {
      // Paragraph
      elements.push(
        <p key={index} className="text-on-surface-variant leading-relaxed text-sm my-2">
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  // Flush remaining list items
  if (inList && listItems.length > 0) {
    elements.push(
      <ul key="ul-final" className="list-disc pl-6 space-y-1.5 my-3 text-on-surface-variant">
        {listItems}
      </ul>
    );
  }

  return <div className="space-y-2">{elements}</div>;
};
