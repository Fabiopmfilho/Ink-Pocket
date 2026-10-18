import { useState } from 'react'

import type { CharacterRecord, LocationRecord } from '../../database/models'
import { useDebouncedSave } from '../../hooks/useDebouncedSave'
import type { Chapter } from '../../types/book'

import RichTextEditor, { type EditorSaveStatus } from './RichTextEditor'
import PageHeader from '../search/PageHeader'

type EditorProps = {
  chapter: Chapter
  characters: CharacterRecord[]
  locations: LocationRecord[]
  wordCount: number
  onUpdate: (field: 'title' | 'content', value: string) => void | Promise<void>
  onOpenReference: (entityId: string) => void
}

function mergeSaveStatus(first: EditorSaveStatus, second: EditorSaveStatus): EditorSaveStatus {
  const statuses = [first, second]

  if (statuses.includes('error')) return 'error'
  if (statuses.includes('saving')) return 'saving'
  if (statuses.includes('editing')) return 'editing'

  return 'saved'
}

function Editor({
  chapter,
  characters,
  locations,
  wordCount,
  onUpdate,
  onOpenReference
}: EditorProps) {
  const [title, setTitle] = useState(chapter.title)
  const [toolbarSlot, setToolbarSlot] = useState<HTMLDivElement | null>(null)

  const [contentSaveStatus, setContentSaveStatus] = useState<EditorSaveStatus>('saved')

  const { status: titleSaveStatus, scheduleSave: scheduleTitleSave } = useDebouncedSave(
    (nextTitle) => onUpdate('title', nextTitle),
    300
  )

  const saveStatus = mergeSaveStatus(contentSaveStatus, titleSaveStatus)

  const saveStatusLabel = {
    editing: 'Editando…',
    saving: 'Salvando…',
    saved: 'Salvo',
    error: 'Erro ao salvar'
  }[saveStatus]

  const fallbackTitle = chapter.type === 'scene' ? 'Cena sem título' : 'Capítulo sem título'

  return (
    <main className="editor-area">
      <PageHeader title={title || fallbackTitle} />

      <div className="editor-toolbar-slot" ref={setToolbarSlot} />

      <div className="editor editor-paper-view">
        <div className="editor-page">
          <input
            className="chapter-title"
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value

              setTitle(nextTitle)
              scheduleTitleSave(nextTitle)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              }
            }}
            placeholder={chapter.type === 'scene' ? 'Título da cena' : 'Título do capítulo'}
          />

          <RichTextEditor
            content={chapter.content}
            characters={characters}
            locations={locations}
            className="manuscript-document"
            placeholder="Comece a escrever..."
            showToolbar
            onSave={(content) => onUpdate('content', content)}
            onOpenReference={onOpenReference}
            onSaveStatusChange={setContentSaveStatus}
            toolbarContainer={toolbarSlot}
          />
        </div>
      </div>

      <footer className="editor-footer">
        <span>{wordCount.toLocaleString('pt-BR')} palavras</span>

        <span className={`save-status ${saveStatus}`}>{saveStatusLabel}</span>
      </footer>
    </main>
  )
}

export default Editor
