// Turns console arguments into the text the output area shows, the way a terminal would for simple values.
export function formatArg(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  if (typeof value === 'undefined') return 'undefined';
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

export function formatLine(args: readonly unknown[]): string {
  return args.map(formatArg).join(' ');
}
