import { useState } from 'react'

import type {
  CharacterRecord,
  DocumentRecord,
  LocationEditableField,
  LocationRecord,
  LocationStatus
} from '../../database/models'

import EntityEditor from './EntityEditor'
import EntityReferences from './EntityReferences'
import RichTextEditor, { type EditorSaveStatus } from './RichTextEditor'
import CategoryField from './CategoryField'
import { getCategoryOptions } from '@renderer/utils/categories'

type LocationTab = 'overview' | 'details' | 'notes' | 'references'

type LocationEditorProps = {
  location: LocationRecord
  characters: CharacterRecord[]
  locations: LocationRecord[]
  documents: DocumentRecord[]
  onOpenDocument: (documentId: string) => void
  onUpdate: (field: LocationEditableField, value: string) => void | Promise<void>
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

function LocationEditor({
  location,
  characters,
  locations,
  documents,
  onOpenDocument,
  onUpdate,
  onCommitName,
  onOpenReference
}: LocationEditorProps) {
  const [activeTab, setActiveTab] = useState<LocationTab>('overview')

  const [descriptionStatus, setDescriptionStatus] = useState<EditorSaveStatus>('saved')

  const [notesStatus, setNotesStatus] = useState<EditorSaveStatus>('saved')

  const saveStatus = mergeSaveStatus(descriptionStatus, notesStatus)

  const categoryOptions = getCategoryOptions(locations)

  return (
    <EntityEditor
      entity={location}
      entityLabel="Lugar"
      namePlaceholder="Nome do lugar"
      characters={characters}
      locations={locations}
      externalSaveStatus={saveStatus}
      onUpdate={onUpdate}
      onCommitName={onCommitName}
      onOpenReference={onOpenReference}
    >
      <nav className="entity-tabs" aria-label="Seções do lugar">
        <button
          type="button"
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Visão geral
        </button>

        <button
          type="button"
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Detalhes
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
            value={location.category}
            options={categoryOptions}
            placeholder="Ex.: Reino de Aldor, Ilhas do Sul"
            onChange={(category) => {
              void onUpdate('category', category)
            }}
          />

          <label className="entity-form-field">
            <span>Tipo de lugar</span>

            <input
              value={location.locationType}
              onChange={(event) => {
                void onUpdate('locationType', event.target.value)
              }}
              placeholder="Cidade, reino, floresta..."
            />
          </label>

          <label className="entity-form-field">
            <span>Região</span>

            <input
              value={location.region}
              onChange={(event) => {
                void onUpdate('region', event.target.value)
              }}
              placeholder="Região ou território"
            />
          </label>

          <label className="entity-form-field">
            <span>Status</span>

            <select
              value={location.status}
              onChange={(event) => {
                void onUpdate('status', event.target.value as LocationStatus)
              }}
            >
              <option value="active">Ativo</option>
              <option value="destroyed">Destruído</option>
              <option value="abandoned">Abandonado</option>
              <option value="unknown">Desconhecido</option>
            </select>
          </label>
        </div>

        <div className="character-field">
          <span>Descrição</span>

          <RichTextEditor
            content={location.description}
            characters={characters}
            locations={locations}
            className="location-document"
            showToolbar
            onSave={(description) => onUpdate('description', description)}
            onOpenReference={onOpenReference}
            onSaveStatusChange={setDescriptionStatus}
          />
        </div>
      </div>

      <div className="entity-tab-panel" hidden={activeTab !== 'details'}>
        <label className="entity-form-field">
          <span>Atmosfera</span>

          <textarea
            value={location.atmosphere}
            onChange={(event) => {
              void onUpdate('atmosphere', event.target.value)
            }}
            placeholder="Clima, sons, cheiros e sensações..."
          />
        </label>

        <label className="entity-form-field">
          <span>História</span>

          <textarea
            value={location.history}
            onChange={(event) => {
              void onUpdate('history', event.target.value)
            }}
            placeholder="Origem e acontecimentos importantes..."
          />
        </label>

        <label className="entity-form-field">
          <span>Cultura</span>

          <textarea
            value={location.culture}
            onChange={(event) => {
              void onUpdate('culture', event.target.value)
            }}
            placeholder="Costumes, crenças e tradições..."
          />
        </label>

        <label className="entity-form-field">
          <span>Perigos</span>

          <textarea
            value={location.dangers}
            onChange={(event) => {
              void onUpdate('dangers', event.target.value)
            }}
            placeholder="Ameaças, conflitos e riscos..."
          />
        </label>

        <label className="entity-form-field">
          <span>Importância para a trama</span>

          <textarea
            value={location.plotImportance}
            onChange={(event) => {
              void onUpdate('plotImportance', event.target.value)
            }}
            placeholder="Como este lugar participa da história?"
          />
        </label>
      </div>

      <div className="entity-tab-panel" hidden={activeTab !== 'notes'}>
        <div className="character-field">
          <span>Notas livres</span>

          <RichTextEditor
            content={location.notes}
            characters={characters}
            locations={locations}
            className="location-document"
            showToolbar
            onSave={(notes) => onUpdate('notes', notes)}
            onOpenReference={onOpenReference}
            onSaveStatusChange={setNotesStatus}
          />
        </div>
      </div>

      <div className="entity-tab-panel" hidden={activeTab !== 'references'}>
        <EntityReferences
          entityId={location.id}
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

export default LocationEditor
