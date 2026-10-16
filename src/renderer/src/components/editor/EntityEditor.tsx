import { useState, type ReactNode } from 'react'

import type { CharacterRecord, LocationRecord } from '../../database/models'

import RichTextEditor, { type EditorSaveStatus } from './RichTextEditor'
import PageHeader from '../search/PageHeader'

type EditableEntity = {
  name: string
  description: string
}

type EntityEditorProps = {
  entity: EditableEntity
  entityLabel: string
  namePlaceholder: string
  descriptionClassName?: string
  characters: CharacterRecord[]
  locations: LocationRecord[]
  children?: ReactNode
  footerText?: string
  externalSaveStatus?: EditorSaveStatus
  onUpdate: (field: 'name' | 'description', value: string) => void | Promise<void>
  onCommitName: () => void | Promise<void>
  onOpenReference: (entityId: string) => void
}

function EntityEditor({
  entity,
  entityLabel,
  namePlaceholder,
  descriptionClassName,
  characters,
  locations,
  children,
  footerText = 'Use @ para personagens e # para lugares',
  externalSaveStatus,
  onUpdate,
  onCommitName,
  onOpenReference
}: EntityEditorProps) {
  const [internalSaveStatus, setInternalSaveStatus] = useState<EditorSaveStatus>('saved')

  const saveStatus = externalSaveStatus ?? internalSaveStatus

  const saveStatusLabel = {
    editing: 'Editando…',
    saving: 'Salvando…',
    saved: 'Salvo',
    error: 'Erro ao salvar'
  }[saveStatus]

  return (
    <main className="editor-area">
      <PageHeader title={entityLabel} />

      <div className="editor character-editor">
        <input
          className="chapter-title"
          value={entity.name}
          onChange={(event) => {
            void onUpdate('name', event.target.value)
          }}
          onBlur={() => {
            void onCommitName()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
          placeholder={namePlaceholder}
        />

        {children ?? (
          <div className="character-field">
            <span>Descrição</span>

            <RichTextEditor
              content={entity.description}
              characters={characters}
              locations={locations}
              className={descriptionClassName}
              showToolbar
              onSave={(description) => onUpdate('description', description)}
              onOpenReference={onOpenReference}
              onSaveStatusChange={setInternalSaveStatus}
            />
          </div>
        )}
      </div>

      <footer className="editor-footer">
        <span>{footerText}</span>

        <span className={`save-status ${saveStatus}`}>{saveStatusLabel}</span>
      </footer>
    </main>
  )
}

export default EntityEditor
