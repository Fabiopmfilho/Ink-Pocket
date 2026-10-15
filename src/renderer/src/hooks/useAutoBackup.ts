import { useEffect } from 'react'

import { runAutoBackup } from '../services/backupService'

const FIRST_BACKUP_DELAY = 10_000
const BACKUP_INTERVAL = 10 * 60 * 1000

export function useAutoBackup(bookId: string | null | undefined): void {
  useEffect(() => {
    if (!bookId) {
      return
    }

    const run = () => {
      runAutoBackup(bookId).catch((error: unknown) => {
        console.error('Backup automático falhou:', error)
      })
    }

    const firstRun = window.setTimeout(run, FIRST_BACKUP_DELAY)
    const interval = window.setInterval(run, BACKUP_INTERVAL)

    return () => {
      window.clearTimeout(firstRun)
      window.clearInterval(interval)
    }
  }, [bookId])
}
