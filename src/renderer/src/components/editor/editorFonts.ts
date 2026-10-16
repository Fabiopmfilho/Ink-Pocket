export type SelectOption = {
  label: string
  value: string
}

export const editorFontFamilies: SelectOption[] = [
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, Times, serif' },
  { label: 'Palatino', value: 'Palatino Linotype, Palatino, Book Antiqua, serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier New', value: 'Courier New, Courier, monospace' }
]

export const editorFontSizes: SelectOption[] = [12, 14, 16, 18, 20, 24, 28, 32, 40].map((size) => ({
  label: String(size),
  value: `${size}px`
}))

export function firstFontFamily(value: string): string {
  return value.split(',')[0].replace(/["']/g, '').trim()
}

const genericFontNames: Record<string, string> = {
  'system-ui': 'Fonte do sistema',
  '-apple-system': 'Fonte do sistema',
  'ui-sans-serif': 'Fonte do sistema',
  'sans-serif': 'Sans-serif',
  serif: 'Serifada',
  monospace: 'Monoespaçada'
}

export function fontDisplayName(familyName: string): string {
  return genericFontNames[familyName.toLowerCase()] ?? familyName
}

export function findFontOption(value: string): SelectOption | undefined {
  const name = firstFontFamily(value).toLowerCase()

  if (!name) {
    return undefined
  }

  return editorFontFamilies.find((option) => firstFontFamily(option.value).toLowerCase() === name)
}
