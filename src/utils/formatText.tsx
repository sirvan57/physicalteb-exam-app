import React from 'react';

// تابع تبدیل نشانه‌گذاری‌های تولیدشده توسط پایپ‌لاین به JSX.
// دو فرمت مختلف در خروجی مدل‌ها دیده شده (بسته به اجرا)، پس هر دو رو پشتیبانی می‌کنیم:
//  - **term**                           → بولد
//  - ==critical==TEXT==/critical==      → هایلایت (نامتقارن)
//  - ==TEXT==                           → هایلایت (متقارن، فرمت جایگزین که در برخی خروجی‌ها اومده)
export const renderFormattedText = (text: string) => {
  if (!text) return '';
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  // ترتیب مهمه: اول حالت نامتقارن critical، بعد ==...== متقارن، بعد **...**
  const regex = /==critical==([\s\S]*?)==\/critical==|==([^=]+)==|\*\*([^*]+)\*\*/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const highlightContent = match[1] ?? match[2];
    if (highlightContent !== undefined) {
      parts.push(
        <mark key={parts.length} className="bg-yellow-200 text-gray-900 font-semibold px-1 rounded">
          {highlightContent}
        </mark>
      );
    } else if (match[3] !== undefined) {
      parts.push(
        <strong key={parts.length} className="font-bold text-gray-900">
          {match[3]}
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
