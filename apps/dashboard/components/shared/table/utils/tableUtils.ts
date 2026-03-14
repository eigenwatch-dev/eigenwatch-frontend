/* eslint-disable @typescript-eslint/no-explicit-any */
export const getDropdownPosition = (event: React.MouseEvent) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const dropdownHeight = 200; // Approximate height of dropdown

  let x = rect.left + rect.width / 2;
  let y = rect.bottom;

  // Adjust if dropdown would go off-screen vertically
  if (y + dropdownHeight > viewportHeight) {
    y = rect.top - 10; // Position above the row
  }

  // Adjust if dropdown would go off-screen horizontally
  if (x > window.innerWidth - 150) {
    x = window.innerWidth - 150;
  }
  if (x < 150) {
    x = 150;
  }

  return { x, y };
};

// utils/tableToCardData.ts

export function tableToCardData({
  data,
  columns,
  idKey = "id",
  titleKey,
  subtitleKey,
}: {
  data: Record<string, any>[];
  columns: { key: string; displayName: string }[];
  idKey?: string;
  titleKey?: string;
  subtitleKey?: string;
}) {
  return data.map((row) => {
    const id = row[idKey];

    const title = titleKey ? row[titleKey] : undefined;
    const subtitle = subtitleKey ? row[subtitleKey] : undefined;

    const fields = columns
      .map((col) => ({
        label: col.displayName,
        value: row[col.key],
      }));

    return {
      id,
      title,
      subtitle,
      fields,
      raw: row,
    };
  });
}
