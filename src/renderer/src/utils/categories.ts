export const UNCATEGORIZED_LABEL = 'Sem categoria'

const UNCATEGORIZED_KEY = '__uncategorized__'

export type CategoryGroup<T> = {
  key: string
  label: string
  category: string | null
  items: T[]
}

export function normalizeCategory(value: string | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ')
}

function categoryKey(value: string): string {
  return normalizeCategory(value).toLocaleLowerCase('pt-BR')
}

export function getCategoryOptions(items: Array<{ category?: string }>): string[] {
  const options = new Map<string, string>()

  for (const item of items) {
    const category = normalizeCategory(item.category)

    if (category && !options.has(categoryKey(category))) {
      options.set(categoryKey(category), category)
    }
  }

  return [...options.values()].sort((first, second) => first.localeCompare(second, 'pt-BR'))
}

export function resolveCategory(value: string, options: string[]): string {
  const normalized = normalizeCategory(value)
  const key = categoryKey(normalized)

  return options.find((option) => categoryKey(option) === key) ?? normalized
}

export function groupByCategory<T extends { category?: string }>(items: T[]): CategoryGroup<T>[] {
  const groups = new Map<string, CategoryGroup<T>>()

  for (const item of items) {
    const category = normalizeCategory(item.category)
    const key = category ? `category:${categoryKey(category)}` : UNCATEGORIZED_KEY

    const group = groups.get(key)

    if (group) {
      group.items.push(item)
    } else {
      groups.set(key, {
        key,
        label: category || UNCATEGORIZED_LABEL,
        category: category || null,
        items: [item]
      })
    }
  }

  const all = [...groups.values()]

  const named = all
    .filter((group) => group.category !== null)
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))

  const uncategorized = all.filter((group) => group.category === null)

  return [...named, ...uncategorized]
}

const CATEGORY_COLORS = [
  '#7c5cbf',
  '#2f8f83',
  '#d0833a',
  '#c2527a',
  '#4f7cc4',
  '#8a9a3b',
  '#b5534b',
  '#5a6b7d'
]

export function getCategoryColor(groupKey: string): string {
  let hash = 0

  for (const character of groupKey) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length] ?? CATEGORY_COLORS[0] ?? '#7c5cbf'
}
