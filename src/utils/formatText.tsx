import React from 'react';

// تابع تبدیل مارک‌داون ساده (**bold** و ==highlight==) به JSX
export const renderFormattedText = (text: string) => {
  if (!text) return '';
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /(\*\*[^*]+\*\*|==[^=]+==)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={parts.length} className="font-bold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('==') && token.endsWith('==')) {
      parts.push(
        <mark key={parts.length} className="bg-yellow-200 text-gray-900 font-medium px-1 rounded">
          {token.slice(2, -2)}
        </mark>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};