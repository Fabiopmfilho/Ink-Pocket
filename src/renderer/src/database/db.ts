import Dexie, { type Table } from 'dexie'

import type { BookRecord, CharacterRecord, DocumentRecord, LocationRecord } from './models'

class BookWriterDatabase extends Dexie {
  books!: Table<BookRecord, string>
  documents!: Table<DocumentRecord, string>
  characters!: Table<CharacterRecord, string>
  locations!: Table<LocationRecord, string>

  constructor() {
    super('book-writer')

    /*
     * Não altere versões antigas.
     * Elas representam a estrutura do banco naquele momento.
     */
    this.version(1).stores({
      books: 'id, title, updatedAt',
      documents: 'id, bookId, parentId, type, [bookId+order], updatedAt',
      characters: 'id, bookId, name, [bookId+name]',
      locations: 'id, bookId, name, [bookId+name]'
    })

    this.version(2)
      .stores({
        books: 'id, title, updatedAt',
        documents: 'id, bookId, parentId, type, [bookId+order], updatedAt',
        characters: 'id, bookId, name, [bookId+name]',
        locations: 'id, bookId, name, [bookId+name]'
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<CharacterRecord, string>('characters')
          .toCollection()
          .modify((character) => {
            character.aliases ??= ''
            character.role ??= ''
            character.age ??= ''
            character.status ??= 'active'
            character.description ??= ''
            character.appearance ??= ''
            character.personality ??= ''
            character.motivation ??= ''
            character.conflict ??= ''
            character.backstory ??= ''
            character.notes ??= ''
          })

        await transaction
          .table<LocationRecord, string>('locations')
          .toCollection()
          .modify((location) => {
            location.locationType ??= ''
            location.region ??= ''
            location.status ??= 'active'
            location.description ??= ''
            location.atmosphere ??= ''
            location.history ??= ''
            location.culture ??= ''
            location.dangers ??= ''
            location.plotImportance ??= ''
            location.notes ??= ''
          })
      })

    this.version(3)
      .stores({
        books: 'id, title, updatedAt',
        documents: 'id, bookId, parentId, type, [bookId+order], updatedAt',
        characters: 'id, bookId, name, [bookId+name]',
        locations: 'id, bookId, name, [bookId+name]'
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<BookRecord, string>('books')
          .toCollection()
          .modify((book) => {
            book.subtitle ??= ''
            book.author ??= ''
            book.genre ??= ''
            book.language ??= 'Português'
            book.synopsis ??= ''
            book.seriesName ??= ''
            book.volumeNumber ??= ''
            book.targetWordCount ??= 0
          })
      })

    this.version(4)
      .stores({
        books: 'id, title, updatedAt',
        documents: 'id, bookId, parentId, type, [bookId+order], updatedAt',
        characters: 'id, bookId, name, [bookId+name]',
        locations: 'id, bookId, name, [bookId+name]'
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<CharacterRecord, string>('characters')
          .toCollection()
          .modify((character) => {
            character.category ??= ''
          })

        await transaction
          .table<LocationRecord, string>('locations')
          .toCollection()
          .modify((location) => {
            location.category ??= ''
          })
      })
  }
}

export const db = new BookWriterDatabase()
