import { useState } from 'react'

import type {
  CharacterEditableField,
  CharacterRecord,
  CharacterStatus,
  DocumentRecord,
  LocationRecord
} from '../../database/models'

import EntityEditor from './EntityEditor'
import EntityReferences from './EntityReferences'
import CategoryField from './CategoryField'
import RichTextEditor, { type EditorSaveStatus } from './RichTextEditor'

import { getCategoryOptions } from '@renderer/utils/categories'

type CharacterTab = 'overview' | 'development' | 'notes' | 'references'

type CharacterEditorProps = {
  character: CharacterRecord
  characters: CharacterRecord[]
  locations: LocationRecord[]
  documents: DocumentRecord[]
  onOpenDocument: (documentId: string) => void
  onUpdate: (field: CharacterEditableField, value: string) => void | Promise<void>
  onCommitName: () => void | Promise<void>
  onOpenReference: (entityId: string) => void
}

function mergeSaveStatus(first: EditorSaveStatus, second: EditorSaveStatus): EditorSaveStatus {
  const statuses = [first, second]

  if (statuses.includes('error')) return 'error'
  if (statuses.includes('saving')) return 'saving'
  if (statuses.includes('editing')) return 'editing'

  return 'saved'
}

function CharacterEditor({
  character,
  characters,
  locations,
  documents,
  onOpenDocument,
  onUpdate,
  onCommitName,
  onOpenReference
}: CharacterEditorProps) {
  const [activeTab, setActiveTab] = useState<CharacterTab>('overview')

  const [descriptionStatus, setDescriptionStatus] = useState<EditorSaveStatus>('saved')

  const [notesStatus, setNotesStatus] = useState<EditorSaveStatus>('saved')

  const saveStatus = mergeSaveStatus(descriptionStatus, notesStatus)

  const categoryOptions = getCategoryOptions(characters)

  return (
    <EntityEditor
      entity={character}
      entityLabel="Personagem"
      namePlaceholder="Nome do personagem"
      characters={characters}
      locations={locations}
      externalSaveStatus={saveStatus}
      onUpdate={onUpdate}
      onCommitName={onCommitName}
      onOpenReference={onOpenReference}
    >
      <nav className="entity-tabs" aria-label="Seções do personagem">
        <button
          type="button"
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Visão geral
        </button>

        <button
          type="button"
          className={activeTab === 'development' ? 'active' : ''}
          onClick={() => setActiveTab('development')}
        >
          Desenvolvimento
        </button>

        <button
          type="button"
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => setActiveTab('notes')}
        >
          Notas
        </button>

        <button
          type="button"
          className={activeTab === 'references' ? 'active' : ''}
          onClick={() => setActiveTab('references')}
        >
          Referências
        </button>
      </nav>

      <div className="entity-tab-panel" hidden={activeTab !== 'overview'}>
        <div className="entity-form-grid">
          <CategoryField
            value={character.category}
            options={categoryOptions}
            placeholder="Ex.: Família real, Guilda dos Magos"
            onChange={(category) => {
              void onUpdate('category', category)
            }}
          />

          <label className="entity-form-field">
            <span>Papel na história</span>

            <input
              value={character.role}
              onChange={(event) => {
                void onUpdate('role', event.target.value)
              }}
              placeholder="Protagonista, antagonista..."
            />
          </label>

          <label className="entity-form-field">
            <span>Idade</span>

            <input
              value={character.age}
              onChange={(event) => {
                void onUpdate('age', event.target.value)
              }}
              placeholder="Ex.: 32 anos"
            />
          </label>

          <label className="entity-form-field">
            <span>Status</span>

            <select
              value={character.status}
              onChange={(event) => {
                void onUpdate('status', event.target.value as CharacterStatus)
              }}
            >
              <option value="active">Ativo</option>
              <option value="dead">Morto</option>
              <option value="missing">Desaparecido</option>
              <option value="unknown">Desconhecido</option>
            </select>
          </label>

          <label className="entity-form-field">
            <span>Apelidos</span>

            <input
              value={character.aliases}
              onChange={(event) => {
                void onUpdate('aliases', event.target.value)
              }}
              placeholder="Separe por vírgulas"
            />
          </label>
        </div>

        <div className="character-field">
          <span>Resumo</span>

          <RichTextEditor
            content={character.description}
            characters={characters}
            locations={locations}
            className="character-document"
            showToolbar
            onSave={(description) => onUpdate('description', description)}
            onOpenReference={onOpenReference}
            onSaveStatusChange={setDescriptionStatus}
          />
        </div>
      </div>

      <div className="entity-tab-panel" hidden={activeTab !== 'development'}>
        <label className="entity-form-field">
          <span>Aparência</span>

          <textarea
            value={character.appearance}
            onChange={(event) => {
              void onUpdate('appearance', event.target.value)
            }}
            placeholder="Características físicas, roupas, postura..."
          />
        </label>

        <label className="entity-form-field">
          <span>Personalidade</span>

          <textarea
            value={character.personality}
            onChange={(event) => {
              void onUpdate('personality', event.target.value)
            }}
            placeholder="Temperamento, qualidades, defeitos..."
          />
        </label>

        <label className="entity-form-field">
          <span>Motivação</span>

          <textarea
            value={character.motivation}
            onChange={(event) => {
              void onUpdate('motivation', event.target.value)
            }}
            placeholder="O que este personagem deseja?"
          />
        </label>

        <label className="entity-form-field">
          <span>Conflito</span>

          <textarea
            value={character.conflict}
            onChange={(event) => {
              void onUpdate('conflict', event.target.value)
            }}
            placeholder="O que impede o personagem?"
          />
        </label>

        <label className="entity-form-field">
          <span>História anterior</span>

          <textarea
            value={character.backstory}
            onChange={(event) => {
              void onUpdate('backstory', event.target.value)
            }}
            placeholder="Passado e acontecimentos importantes..."
          />
        </label>
      </div>

      <div className="entity-tab-panel" hidden={activeTab !== 'notes'}>
        <div className="character-field">
          <span>Notas livres</span>

          <RichTextEditor
            content={character.notes}
            characters={characters}
            locations={locations}
            className="character-document"
            showToolbar
            onSave={(notes) => onUpdate('notes', notes)}
            onOpenReference={onOpenReference}
            onSaveStatusChange={setNotesStatus}
          />
        </div>
      </div>

      <div className="entity-tab-panel" hidden={activeTab !== 'references'}>
        <EntityReferences
          entityId={character.id}
          documents={documents}
          characters={characters}
          locations={locations}
          onOpenDocument={onOpenDocument}
          onOpenReference={onOpenReference}
        />
      </div>
    </EntityEditor>
  )
}

export default CharacterEditor
