import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'fs/promises'
import { basename, join } from 'path'

const BACKUP_FILTERS = [{ name: 'Backup do livro (JSON)', extensions: ['json'] }]
const MAX_IMPORT_SIZE = 50 * 1024 * 1024

const AUTO_BACKUP_PATTERN = /^backup-(\d{4}-\d{2}-\d{2})-([\w-]+)\.json$/
const AUTO_BACKUP_KEEP = 14
const BOOK_ID_PATTERN = /^[\w-]{1,100}$/

function getAutoBackupFolder(): string {
  return join(app.getPath('userData'), 'backups')
}

export async function openAutoBackupFolder(): Promise<void> {
  const folder = getAutoBackupFolder()

  await mkdir(folder, { recursive: true })

  const error = await shell.openPath(folder)

  if (error) {
    throw new Error(error)
  }
}

async function writeFileSafely(filePath: string, content: string): Promise<void> {
  const temporaryPath = `${filePath}.tmp`

  await writeFile(temporaryPath, content, 'utf-8')
  await rename(temporaryPath, filePath)
}

function toSafeFileName(name: string): string {
  const cleaned = basename(name)
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim()

  return cleaned || 'backup.json'
}

export function registerBackupHandlers(): void {
  ipcMain.handle('backup:save', async (event, content: unknown, suggestedName: unknown) => {
    if (typeof content !== 'string' || typeof suggestedName !== 'string') {
      throw new Error('Dados de backup inválidos.')
    }

    const options = {
      title: 'Exportar backup',
      defaultPath: join(app.getPath('documents'), toSafeFileName(suggestedName)),
      filters: BACKUP_FILTERS
    }

    const window = BrowserWindow.fromWebContents(event.sender)
    const result = window
      ? await dialog.showSaveDialog(window, options)
      : await dialog.showSaveDialog(options)

    if (result.canceled || !result.filePath) {
      return { saved: false }
    }

    await writeFileSafely(result.filePath, content)

    return { saved: true, path: result.filePath }
  })

  ipcMain.handle('backup:open', async (event) => {
    const options = {
      title: 'Importar backup',
      properties: ['openFile' as const],
      filters: BACKUP_FILTERS
    }

    const window = BrowserWindow.fromWebContents(event.sender)
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)

    const filePath = result.filePaths[0]

    if (result.canceled || !filePath) {
      return null
    }

    const { size } = await stat(filePath)

    if (size > MAX_IMPORT_SIZE) {
      throw new Error('O arquivo é grande demais para ser um backup do livro.')
    }

    return { path: filePath, content: await readFile(filePath, 'utf-8') }
  })

  ipcMain.handle('backup:auto', async (_event, content: unknown, bookId: unknown) => {
    if (
      typeof content !== 'string' ||
      typeof bookId !== 'string' ||
      !BOOK_ID_PATTERN.test(bookId)
    ) {
      throw new Error('Dados de backup inválidos.')
    }

    const folder = getAutoBackupFolder()
    await mkdir(folder, { recursive: true })

    // Date format AAAA-MM-DD.
    const day = new Date().toLocaleDateString('sv-SE')
    const filePath = join(folder, `backup-${day}-${bookId}.json`)

    await writeFileSafely(filePath, content)

    const bookFiles = (await readdir(folder))
      .filter((name) => AUTO_BACKUP_PATTERN.exec(name)?.[2] === bookId)
      .sort()

    const expired = bookFiles.slice(0, Math.max(0, bookFiles.length - AUTO_BACKUP_KEEP))

    await Promise.all(expired.map((name) => rm(join(folder, name), { force: true })))

    return { path: filePath }
  })
}
