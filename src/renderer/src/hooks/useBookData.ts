import { useCallback, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '../database/db'
import type { BookRecord, CharacterRecord, LocationRecord } from '../database/models'
import { ensureInitialBook } from '../database/seed'
import type { Chapter } from '../types/book'

const LAST_BOOK_KEY = 'ink-pocket:last-book-id'

function readLastBookId(): string | null {
  try {
    return window.localStorage.getItem(LAST_BOOK_KEY)
  } catch {
    return null
  }
}

function saveLastBookId(bookId: string): void {
  try {
    window.localStorage.setItem(LAST_BOOK_KEY, bookId)
  } catch {}
}

export function useBookData() {
  const [activeBookId, setActiveBookId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadInitialBook() {
      const initialBookId = await ensureInitialBook()

      const lastBookId = readLastBookId()
      const lastBook = lastBookId ? await db.books.get(lastBookId) : undefined

      if (mounted) {
        setActiveBookId(lastBook ? lastBook.id : initialBookId)
      }
    }

    void loadInitialBook()

    return () => {
      mounted = false
    }
  }, [])

  const selectBook = useCallback((bookId: string) => {
    saveLastBookId(bookId)
    setActiveBookId(bookId)
  }, [])

  const books = useLiveQuery(
    async (): Promise<BookRecord[]> => {
      const allBooks = await db.books.toArray()

      return allBooks.sort((first, second) => first.title.localeCompare(second.title, 'pt-BR'))
    },
    [],
    [] as BookRecord[]
  )

  const book = useLiveQuery(async () => {
    if (!activeBookId) {
      return undefined
    }

    return db.books.get(activeBookId)
  }, [activeBookId])

  const documents = useLiveQuery(
    async (): Promise<Chapter[]> => {
      if (!activeBookId) {
        return []
      }

      return db.documents.where('bookId').equals(activeBookId).sortBy('order')
    },
    [activeBookId],
    [] as Chapter[]
  )

  const characters = useLiveQuery(
    async (): Promise<CharacterRecord[]> => {
      if (!activeBookId) {
        return []
      }

      return db.characters.where('bookId').equals(activeBookId).sortBy('name')
    },
    [activeBookId],
    [] as CharacterRecord[]
  )

  const locations = useLiveQuery(
    async (): Promise<LocationRecord[]> => {
      if (!activeBookId) {
        return []
      }

      return db.locations.where('bookId').equals(activeBookId).sortBy('name')
    },
    [activeBookId],
    [] as LocationRecord[]
  )

  return {
    activeBookId,
    book,
    books,
    documents,
    characters,
    locations,
    selectBook,
    loading: !activeBookId || book === undefined
  }
}
