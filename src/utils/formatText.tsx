import React from 'react';

// تابع تبدیل نشانه‌گذاری‌های تولیدشده توسط پایپ‌لاین به JSX:
//  - **term**                      → بولد
//  - ==critical==TEXT==/critical== → هایلایت (نامتقارن؛ باز و بسته با هم فرق دارن)
export const renderFormattedText = (text: string) => {
  if (!text) return '';
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  // ترتیب مهمه: اول ==critical==...==/critical== (نامتقارن)، بعد **...** (متقارن)
  const regex = /==critical==([\s\S]*?)==\/critical==|\*\*([^*]+)\*\*/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      // ==critical==...==/critical==
      parts.push(
        <mark key={parts.length} className="bg-yellow-200 text-gray-900 font-semibold px-1 rounded">
          {match[1]}
        </mark>
      );
    } else if (match[2] !== undefined) {
      // **term**
      parts.push(
        <strong key={parts.length} className="font-bold text-gray-900">
          {match[2]}
        </strong>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};
