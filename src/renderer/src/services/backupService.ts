import { db } from '../database/db'
import type {
  BookRecord,
  CharacterRecord,
  CharacterStatus,
  DocumentRecord,
  DocumentType,
  LocationRecord,
  LocationStatus
} from '../database/models'
import { getWordCount } from '../utils/textStats'

export const BACKUP_APP = 'ink-pocket'
export const BACKUP_FORMAT_VERSION = 1

export type BackupFile = {
  app: typeof BACKUP_APP
  formatVersion: number
  exportedAt: string
  book: BookRecord
  documents: DocumentRecord[]
  characters: CharacterRecord[]
  locations: LocationRecord[]
}

export type BackupSummary = {
  chapters: number
  scenes: number
  characters: number
  locations: number
  words: number
}

const DOCUMENT_TYPES: readonly DocumentType[] = ['chapter', 'scene', 'note']
const CHARACTER_STATUSES: readonly CharacterStatus[] = ['active', 'dead', 'missing', 'unknown']
const LOCATION_STATUSES: readonly LocationStatus[] = ['active', 'destroyed', 'abandoned', 'unknown']

// ---------------------------------------------------------------------------
// Exportar
// ---------------------------------------------------------------------------

export async function createBackup(bookId: string): Promise<BackupFile> {
  return db.transaction('r', [db.books, db.documents, db.characters, db.locations], async () => {
    const book = await db.books.get(bookId)

    if (!book) {
      throw new Error('Livro não encontrado.')
    }

    const [documents, characters, locations] = await Promise.all([
      db.documents.where('bookId').equals(bookId).toArray(),
      db.characters.where('bookId').equals(bookId).toArray(),
      db.locations.where('bookId').equals(bookId).toArray()
    ])

    return {
      app: BACKUP_APP,
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      book,
      documents,
      characters,
      locations
    }
  })
}

export function getBackupFileName(bookTitle: string): string {
  const slug = bookTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug || 'livro'}-backup-${new Date().toLocaleDateString('sv-SE')}.json`
}

export function summarizeBackup(backup: BackupFile): BackupSummary {
  const writing = backup.documents.filter(
    (document) => document.type === 'chapter' || document.type === 'scene'
  )

  return {
    chapters: backup.documents.filter((document) => document.type === 'chapter').length,
    scenes: backup.documents.filter((document) => document.type === 'scene').length,
    characters: backup.characters.length,
    locations: backup.locations.length,
    words: writing.reduce((total, document) => total + getWordCount(document.content), 0)
  }
}

// ---------------------------------------------------------------------------
// Validar o arquivo ao importar
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readDate(value: unknown): Date {
  const parsed = typeof value === 'string' || typeof value === 'number' ? new Date(value) : null

  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date()
}

function readOneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback
}

function isPresent<T>(value: T | null): value is T {
  return value !== null
}

function normalizeBook(raw: unknown): BookRecord | null {
  if (!isRecord(raw)) return null

  const id = readString(raw.id)

  if (!id) return null

  return {
    id,
    title: readString(raw.title),
    subtitle: readString(raw.subtitle),
    author: readString(raw.author),
    genre: readString(raw.genre),
    language: readString(raw.language, 'Português'),
    synopsis: readString(raw.synopsis),
    seriesName: readString(raw.seriesName),
    volumeNumber: readString(raw.volumeNumber),
    targetWordCount: readNumber(raw.targetWordCount),
    createdAt: readDate(raw.createdAt),
    updatedAt: readDate(raw.updatedAt)
  }
}

function normalizeDocument(raw: unknown): DocumentRecord | null {
  if (!isRecord(raw)) return null

  const id = readString(raw.id)

  if (!id) return null

  return {
    id,
    bookId: readString(raw.bookId),
    parentId: typeof raw.parentId === 'string' ? raw.parentId : null,
    type: readOneOf(raw.type, DOCUMENT_TYPES, 'chapter'),
    title: readString(raw.title),
    content: readString(raw.content),
    notes: readString(raw.notes),
    order: readNumber(raw.order),
    createdAt: readDate(raw.createdAt),
    updatedAt: readDate(raw.updatedAt)
  }
}

function normalizeCharacter(raw: unknown): CharacterRecord | null {
  if (!isRecord(raw)) return null

  const id = readString(raw.id)

  if (!id) return null

  return {
    id,
    bookId: readString(raw.bookId),
    name: readString(raw.name),
    aliases: readString(raw.aliases),
    role: readString(raw.role),
    age: readString(raw.age),
    status: readOneOf(raw.status, CHARACTER_STATUSES, 'active'),
    description: readString(raw.description),
    appearance: readString(raw.appearance),
    personality: readString(raw.personality),
    motivation: readString(raw.motivation),
    conflict: readString(raw.conflict),
    backstory: readString(raw.backstory),
    notes: readString(raw.notes),
    createdAt: readDate(raw.createdAt),
    updatedAt: readDate(raw.updatedAt)
  }
}

function normalizeLocation(raw: unknown): LocationRecord | null {
  if (!isRecord(raw)) return null

  const id = readString(raw.id)

  if (!id) return null

  return {
    id,
    bookId: readString(raw.bookId),
    name: readString(raw.name),
    locationType: readString(raw.locationType),
    region: readString(raw.region),
    status: readOneOf(raw.status, LOCATION_STATUSES, 'active'),
    description: readString(raw.description),
    atmosphere: readString(raw.atmosphere),
    history: readString(raw.history),
    culture: readString(raw.culture),
    dangers: readString(raw.dangers),
    plotImportance: readString(raw.plotImportance),
    notes: readString(raw.notes),
    createdAt: readDate(raw.createdAt),
    updatedAt: readDate(raw.updatedAt)
  }
}

export function parseBackup(text: string): BackupFile {
  let raw: unknown

  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('O arquivo não é um JSON válido.')
  }

  if (!isRecord(raw) || raw.app !== BACKUP_APP) {
    throw new Error('Este arquivo não é um backup do Ink Pocket.')
  }

  const formatVersion = readNumber(raw.formatVersion)

  if (formatVersion < 1) {
    throw new Error('O arquivo de backup está incompleto ou corrompido.')
  }

  if (formatVersion > BACKUP_FORMAT_VERSION) {
    throw new Error(
      'Este backup foi criado por uma versão mais nova do app. Atualize o app para importá-lo.'
    )
  }

  const book = normalizeBook(raw.book)

  if (!book) {
    throw new Error('O backup não contém os dados do livro.')
  }

  const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

  return {
    app: BACKUP_APP,
    formatVersion,
    exportedAt: readString(raw.exportedAt),
    book,
    documents: list(raw.documents).map(normalizeDocument).filter(isPresent),
    characters: list(raw.characters).map(normalizeCharacter).filter(isPresent),
    locations: list(raw.locations).map(normalizeLocation).filter(isPresent)
  }
}

// ---------------------------------------------------------------------------
// Importar como novo livro
// ---------------------------------------------------------------------------

const ID_FIELDS = new Set(['id', 'bookId', 'parentId'])

function remapReferences(html: string, idMap: Map<string, string>): string {
  return html.replace(
    /(data-[\w-]*id=")([^"]*)(")/g,
    (match, prefix: string, id: string, suffix: string) => {
      const newId = idMap.get(id)

      return newId ? `${prefix}${newId}${suffix}` : match
    }
  )
}

function remapTextFields<T extends object>(record: T, idMap: Map<string, string>): T {
  const entries = Object.entries(record).map(([key, value]) => [
    key,
    typeof value === 'string' && !ID_FIELDS.has(key) ? remapReferences(value, idMap) : value
  ])

  return Object.fromEntries(entries) as T
}

export async function importBackupAsNewBook(backup: BackupFile): Promise<string> {
  const newBookId = crypto.randomUUID()
  const idMap = new Map<string, string>()

  for (const record of [...backup.documents, ...backup.characters, ...backup.locations]) {
    idMap.set(record.id, crypto.randomUUID())
  }

  const documents = backup.documents.map((document) => ({
    ...remapTextFields(document, idMap),
    id: idMap.get(document.id) as string,
    bookId: newBookId,
    parentId: document.parentId ? (idMap.get(document.parentId) ?? null) : null
  }))

  const characters = backup.characters.map((character) => ({
    ...remapTextFields(character, idMap),
    id: idMap.get(character.id) as string,
    bookId: newBookId
  }))

  const locations = backup.locations.map((location) => ({
    ...remapTextFields(location, idMap),
    id: idMap.get(location.id) as string,
    bookId: newBookId
  }))

  await db.transaction('rw', [db.books, db.documents, db.characters, db.locations], async () => {
    const sameTitleCount = await db.books.where('title').equals(backup.book.title).count()

    await db.books.add({
      ...backup.book,
      id: newBookId,
      title: sameTitleCount > 0 ? `${backup.book.title} (importado)` : backup.book.title,
      updatedAt: new Date()
    })

    await db.documents.bulkAdd(documents)
    await db.characters.bulkAdd(characters)
    await db.locations.bulkAdd(locations)
  })

  return newBookId
}

// ---------------------------------------------------------------------------
// Backup automático
// ---------------------------------------------------------------------------

export async function runAutoBackup(bookId: string): Promise<void> {
  const backup = await createBackup(bookId)

  if (
    backup.documents.length === 0 &&
    backup.characters.length === 0 &&
    backup.locations.length === 0
  ) {
    return
  }

  await window.api.saveAutoBackup(JSON.stringify(backup), backup.book.id)
}
