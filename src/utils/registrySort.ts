// مرتب‌سازی صحیح گره‌های رجیستری بر اساس ساختار سلسله‌مراتبی (نه فقط ستون order_index خام).
//
// چرا لازمه: order_index در دیتابیس فقط نسبت به والد خودش معناداره (مثلاً §2.1 تا §2.9 هرکدوم
// از 1 شماره می‌خورن، جدا از §1.1 تا §1.7). اگر مستقیم توسط SQL روی همین یک ستون سورت کنیم،
// همه‌ی گره‌هایی که order_index=1 دارن (از هر والدی) کنار هم میان، بعد همه‌ی order_index=2، و...
// نتیجه‌اش پرش‌های عجیب بین شماره‌هاست (مثل §1.4 بعدش §2.9). این تابع یک پیمایش عمقی (DFS)
// درست از ریشه به فرزندان انجام می‌ده تا ترتیب واقعی و خوانا به‌دست بیاد.

export interface RegistryNodeLike {
  section_id: string;
  parent_id: string | null;
  order_index: number;
  [key: string]: any;
}

export function sortRegistryHierarchically<T extends RegistryNodeLike>(nodes: T[]): T[] {
  const childrenByParent = new Map<string | null, T[]>();
  for (const node of nodes) {
    const key = node.parent_id;
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key)!.push(node);
  }
  for (const list of childrenByParent.values()) {
    list.sort((a, b) => a.order_index - b.order_index);
  }

  const result: T[] = [];
  const visit = (parentId: string | null) => {
    const children = childrenByParent.get(parentId) || [];
    for (const child of children) {
      result.push(child);
      visit(child.section_id);
    }
  };
  visit(null);

  // اگه به هر دلیلی گره‌ای یتیم بود (parent_id به گره‌ای اشاره کرد که در همین لیست نیست)،
  // آخر لیست اضافه‌اش کن تا داده گم نشه، نه اینکه بی‌صدا حذف بشه.
  const included = new Set(result.map((n) => n.section_id));
  for (const node of nodes) {
    if (!included.has(node.section_id)) result.push(node);
  }

  return result;
}
