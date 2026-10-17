import { useCallback, useEffect, useRef } from 'react'

import type { BookRecord } from '../database/models'
import {
  createBackup,
  getBackupFileName,
  importBackupAsNewBook,
  parseBackup,
  summarizeBackup
} from '../services/backupService'
import { createBookRecord, deleteBookRecord } from '../services/bookService'
import type { NoticeKind } from './useNotice'

type BookLibraryOptions = {
  activeBookId: string | null
  books: BookRecord[]
  onSelectBook: (bookId: string) => void
  onNotice: (kind: NoticeKind, text: string) => void
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
}

export function useBookLibrary({
  activeBookId,
  books,
  onSelectBook,
  onNotice
}: BookLibraryOptions) {
  const busyRef = useRef(false)

  const createBook = useCallback(async () => {
    try {
      const bookId = await createBookRecord()

      onSelectBook(bookId)
      onNotice('success', 'Livro criado. Mude o título em Configurações.')
    } catch (error) {
      onNotice('error', `Não foi possível criar o livro: ${getErrorMessage(error)}`)
    }
  }, [onSelectBook, onNotice])

  async function exportBook() {
    if (!activeBookId) return

    try {
      const backup = await createBackup(activeBookId)

      const result = await window.api.saveBackup(
        JSON.stringify(backup, null, 2),
        getBackupFileName(backup.book.title)
      )

      if (result.saved) {
        onNotice('success', `Backup salvo em ${result.path}`)
      }
    } catch (error) {
      onNotice('error', `Não foi possível exportar: ${getErrorMessage(error)}`)
    }
  }

  async function importBook() {
    try {
      const file = await window.api.openBackup()

      if (!file) return

      const backup = parseBackup(file.content)
      const summary = summarizeBackup(backup)
      const title = backup.book.title || 'Livro sem título'

      const confirmed = window.confirm(
        `Importar "${title}" como um novo livro?\n\n` +
          `${summary.chapters} capítulos, ${summary.scenes} cenas, ` +
          `${summary.characters} personagens, ${summary.locations} lugares ` +
          `(${summary.words.toLocaleString('pt-BR')} palavras).\n\n` +
          'Os seus livros atuais não serão alterados.'
      )

      if (!confirmed) return

      const newBookId = await importBackupAsNewBook(backup)

      onSelectBook(newBookId)
      onNotice('success', `Livro "${title}" importado.`)
    } catch (error) {
      onNotice('error', `Não foi possível importar: ${getErrorMessage(error)}`)
    }
  }

  async function deleteBook() {
    if (!activeBookId) return

    if (books.length <= 1) {
      onNotice('error', 'Este é o seu único livro. Crie ou importe outro antes de excluí-lo.')
      return
    }

    const activeBook = books.find((book) => book.id === activeBookId)
    const otherBook = books.find((book) => book.id !== activeBookId)

    if (!activeBook || !otherBook) return

    const confirmed = window.confirm(
      `Excluir o livro "${activeBook.title || 'Livro sem título'}"?\n\n` +
        'Todos os capítulos, cenas, personagens e lugares dele serão apagados. ' +
        'Esta ação não pode ser desfeita.\n\n' +
        'Dica: exporte um backup antes (Arquivo › Exportar backup).'
    )

    if (!confirmed) return

    try {
      onSelectBook(otherBook.id)

      await deleteBookRecord(activeBookId)

      onNotice('success', 'Livro excluído.')
    } catch (error) {
      onNotice('error', `Não foi possível excluir: ${getErrorMessage(error)}`)
    }
  }

  async function runExclusive(task: () => Promise<void>) {
    if (busyRef.current) return

    busyRef.current = true

    try {
      await task()
    } finally {
      busyRef.current = false
    }
  }

  function runAction(action: string): void {
    switch (action) {
      case 'new-book':
        void runExclusive(createBook)
        break
      case 'export-backup':
        void runExclusive(exportBook)
        break
      case 'import-backup':
        void runExclusive(importBook)
        break
      case 'delete-book':
        void runExclusive(deleteBook)
        break
    }
  }

  const runActionRef = useRef(runAction)

  useEffect(() => {
    runActionRef.current = runAction
  })

  useEffect(() => window.api.onMenuAction((action) => runActionRef.current(action)), [])

  return { createBook }
}
