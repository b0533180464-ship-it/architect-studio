// Hebrew to English transliteration map
const HEBREW_MAP: Record<string, string> = {
  'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
  'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
  'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'p',
  'צ': 'ts', 'ץ': 'ts', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
};

/**
 * Transliterate Hebrew text to English letters
 */
export function transliterate(text: string): string {
  return text.split('').map((char) => HEBREW_MAP[char] || char).join('');
}

/**
 * Generate URL-safe slug from text (supports Hebrew)
 */
export function generateSlug(text: string): string {
  const transliterated = transliterate(text);
  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
