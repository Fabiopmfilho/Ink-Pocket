import { createContext } from 'react'

import type { BookRecord } from '@renderer/database/models'

export type BookLibraryValue = {
  books: BookRecord[]
  activeBookId: string | null
  onSelectBook: (bookId: string) => void
  onCreateBook: () => void
}

export const BookLibraryContext = createContext<BookLibraryValue | null>(null)
