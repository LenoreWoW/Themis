/**
 * Transforms a dotted label (e.g. "save.report") into a human-readable format (e.g. "Save Report").
 * 
 * @param raw - The input string in dotted format, can be null or undefined
 * @returns A human-readable string with each word properly capitalized, or an empty string for null/undefined/empty inputs
 */
export function humanizeLabel(raw: string | null | undefined): string {
  if (!raw) return '';
  
  return raw
    .split('.')
    .filter(fragment => fragment.length > 0)
    .map(fragment => fragment.charAt(0).toUpperCase() + fragment.slice(1))
    .join(' ');
} 