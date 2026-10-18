import { createContext } from 'react'

export type HomeNavigationValue = {
  onGoHome: () => void
}

export const HomeNavigationContext = createContext<HomeNavigationValue | null>(null)
