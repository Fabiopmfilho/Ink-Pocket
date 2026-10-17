import { db } from '../database/db'
import type { BookEditableField, BookRecord } from '../database/models'

export async function updateBookRecord(
  bookId: string,
  field: BookEditableField,
  value: string | number
): Promise<void> {
  await db.books.update(bookId, {
    [field]: value,
    updatedAt: new Date()
  } as Partial<BookRecord>)
}

export async function createBookRecord(baseTitle = 'Novo livro'): Promise<string> {
  let title = baseTitle
  let attempt = 1

  while ((await db.books.where('title').equals(title).count()) > 0) {
    attempt += 1
    title = `${baseTitle} ${attempt}`
  }

  const now = new Date()

  const book: BookRecord = {
    id: crypto.randomUUID(),
    title,
    subtitle: '',
    author: '',
    genre: '',
    language: 'Português',
    synopsis: '',
    seriesName: '',
    volumeNumber: '',
    targetWordCount: 0,
    createdAt: now,
    updatedAt: now
  }

  await db.books.add(book)

  return book.id
}

export async function deleteBookRecord(bookId: string): Promise<void> {
  await db.transaction('rw', [db.books, db.documents, db.characters, db.locations], async () => {
    await db.documents.where('bookId').equals(bookId).delete()
    await db.characters.where('bookId').equals(bookId).delete()
    await db.locations.where('bookId').equals(bookId).delete()
    await db.books.delete(bookId)
  })
}
