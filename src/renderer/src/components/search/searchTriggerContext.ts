import { createContext } from 'react'

export type SearchTriggerValue = {
  onOpen: () => void
  shortcut?: string
}

export const SearchTriggerContext = createContext<SearchTriggerValue | null>(null)
