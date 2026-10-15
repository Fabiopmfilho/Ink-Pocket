import { useState } from 'react'

import type { BookRecord } from '@renderer/database/models'
import {
  createBackup,
  getBackupFileName,
  importBackupAsNewBook,
  parseBackup,
  summarizeBackup
} from '@renderer/services/backupService'

type BackupPanelProps = {
  book: BookRecord

  onImported?: (bookId: string) => void
}

type Feedback = {
  kind: 'success' | 'error'
  text: string
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
}

function BackupPanel({ book, onImported }: BackupPanelProps) {
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  async function handleExport() {
    setBusy(true)
    setFeedback(null)

    try {
      const backup = await createBackup(book.id)

      const result = await window.api.saveBackup(
        JSON.stringify(backup, null, 2),
        getBackupFileName(book.title)
      )

      if (result.saved) {
        setFeedback({ kind: 'success', text: `Backup salvo em ${result.path}` })
      }
    } catch (error) {
      setFeedback({ kind: 'error', text: `Não foi possível exportar: ${getErrorMessage(error)}` })
    } finally {
      setBusy(false)
    }
  }

  async function handleImport() {
    setBusy(true)
    setFeedback(null)

    try {
      const file = await window.api.openBackup()

      if (!file) {
        return
      }

      const backup = parseBackup(file.content)
      const summary = summarizeBackup(backup)

      const confirmed = window.confirm(
        `Importar "${backup.book.title || 'Livro sem título'}" como um novo livro?\n\n` +
          `${summary.chapters} capítulos, ${summary.scenes} cenas, ` +
          `${summary.characters} personagens, ${summary.locations} lugares ` +
          `(${summary.words.toLocaleString('pt-BR')} palavras).\n\n` +
          'O livro atual não será alterado.'
      )

      if (!confirmed) {
        return
      }

      const newBookId = await importBackupAsNewBook(backup)

      setFeedback({ kind: 'success', text: 'Livro importado com sucesso.' })
      onImported?.(newBookId)
    } catch (error) {
      setFeedback({ kind: 'error', text: `Não foi possível importar: ${getErrorMessage(error)}` })
    } finally {
      setBusy(false)
    }
  }

  async function handleOpenFolder() {
    try {
      await window.api.openBackupsFolder()
    } catch (error) {
      setFeedback({
        kind: 'error',
        text: `Não foi possível abrir a pasta: ${getErrorMessage(error)}`
      })
    }
  }

  return (
    <section className="backup-panel">
      <header>
        <h2>Backup</h2>

        <p>
          Seu livro fica salvo apenas neste computador. Exporte uma cópia de vez em quando e
          guarde-a em outro lugar, como nuvem ou pendrive. O app também salva um backup automático
          por dia.
        </p>
      </header>

      <div className="backup-panel-actions">
        <button type="button" className="secondary-button" onClick={handleExport} disabled={busy}>
          Exportar backup
        </button>

        {onImported && (
          <button type="button" className="secondary-button" onClick={handleImport} disabled={busy}>
            Importar como novo livro
          </button>
        )}

        <button type="button" className="secondary-button" onClick={handleOpenFolder}>
          Abrir pasta dos backups automáticos
        </button>
      </div>

      {feedback && (
        <p className={`backup-panel-feedback ${feedback.kind}`} role="status">
          {feedback.text}
        </p>
      )}
    </section>
  )
}

export default BackupPanel
