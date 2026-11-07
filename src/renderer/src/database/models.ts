export type DocumentType = 'chapter' | 'scene' | 'note'

export type BookRecord = {
  id: string
  title: string
  subtitle: string
  author: string
  genre: string
  language: string
  synopsis: string
  seriesName: string
  volumeNumber: string
  targetWordCount: number
  createdAt: Date
  updatedAt: Date
}

export type BookEditableField =
  | 'title'
  | 'subtitle'
  | 'author'
  | 'genre'
  | 'language'
  | 'synopsis'
  | 'seriesName'
  | 'volumeNumber'
  | 'targetWordCount'

export type DocumentRecord = {
  id: string
  bookId: string
  parentId: string | null
  type: DocumentType
  title: string
  content: string
  notes: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export type CharacterStatus = 'active' | 'dead' | 'missing' | 'unknown'

export type CharacterRecord = {
  id: string
  bookId: string

  name: string
  category: string
  aliases: string
  role: string
  age: string
  status: CharacterStatus

  description: string
  appearance: string
  personality: string
  motivation: string
  conflict: string
  backstory: string
  notes: string

  createdAt: Date
  updatedAt: Date
}

export type CharacterEditableField =
  | 'name'
  | 'category'
  | 'aliases'
  | 'role'
  | 'age'
  | 'status'
  | 'description'
  | 'appearance'
  | 'personality'
  | 'motivation'
  | 'conflict'
  | 'backstory'
  | 'notes'

export type LocationStatus = 'active' | 'destroyed' | 'abandoned' | 'unknown'

export type LocationRecord = {
  id: string
  bookId: string

  name: string
  category: string
  locationType: string
  region: string
  status: LocationStatus

  description: string
  atmosphere: string
  history: string
  culture: string
  dangers: string
  plotImportance: string
  notes: string

  createdAt: Date
  updatedAt: Date
}

export type LocationEditableField =
  | 'name'
  | 'category'
  | 'locationType'
  | 'region'
  | 'status'
  | 'description'
  | 'atmosphere'
  | 'history'
  | 'culture'
  | 'dangers'
  | 'plotImportance'
  | 'notes'
