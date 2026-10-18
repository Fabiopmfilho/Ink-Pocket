import { useCallback, useEffect, useState, useMemo } from 'react'

import './assets/main.css'

import CharacterEditor from './components/editor/CharacterEditor'
import Editor from './components/editor/Editor'
import LocationEditor from './components/editor/LocationEditor'
import HomePage from './components/home/HomePage'
import Inspector from './components/inspector/Inspector'
import ChapterOverview from './components/manuscript/ChapterOverview'
import Notice from './components/notice/Notice'
import Sidebar from './components/sidebar/Sidebar'
import QuickSearch from './components/search/QuickSearch'
import TitleBar from './components/titlebar/TitleBar'

import { SearchTriggerContext } from './components/search/searchTriggerContext'
import { BookLibraryContext } from './components/library/BookLibraryContext'
import { HomeNavigationContext } from './components/search/Homenavigationcontext'

import type {
  BookEditableField,
  CharacterEditableField,
  LocationEditableField
} from './database/models'
import type { Chapter } from './types/book'

import { useAutoBackup } from './hooks/useAutoBackup'
import { useBookData } from './hooks/useBookData'
import { useBookLibrary } from './hooks/useBookLibrary'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useNotice } from './hooks/useNotice'

import { getCharacterCount, getWordCount } from './utils/textStats'

import { updateBookRecord } from './services/bookService'
import {
  createChapterRecord,
  createSceneRecord,
  getDocumentDeletionMessage,
  moveSceneRecord,
  removeDocumentRecord,
  reorderDocumentRecords,
  updateDocumentRecord
} from './services/documentService'

import {
  commitCharacterNameRecord,
  commitLocationNameRecord,
  createCharacterRecord,
  createLocationRecord,
  removeCharacterRecord,
  removeLocationRecord,
  updateCharacterRecord,
  updateLocationRecord
} from './services/entityService'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'

type Selection =
  | { type: 'home' }
  | { type: 'document'; id: string }
  | { type: 'character'; id: string }
  | { type: 'location'; id: string }

function App() {
  const [selection, setSelection] = useState<Selection>({
    type: 'home'
  })

  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [inspectorVisible, setInspectorVisible] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [quickSearchOpen, setQuickSearchOpen] = useState(false)

  const { activeBookId, book, books, documents, characters, locations, loading, selectBook } =
    useBookData()

  useAutoBackup(activeBookId)

  const { notice, showNotice, dismissNotice } = useNotice()

  const homeNavigation = useMemo(() => ({ onGoHome: () => setSelection({ type: 'home' }) }), [])

  const switchBook = useCallback(
    (bookId: string) => {
      setSelection({ type: 'home' })
      selectBook(bookId)
    },
    [selectBook]
  )

  const { createBook } = useBookLibrary({
    activeBookId,
    books,
    onSelectBook: switchBook,
    onNotice: showNotice
  })

  const bookLibrary = useMemo(
    () => ({
      books,
      activeBookId,
      onSelectBook: switchBook,
      onCreateBook: () => void createBook()
    }),
    [books, activeBookId, switchBook, createBook]
  )

  useKeyboardShortcuts({
    focusMode,
    onToggleFocusMode: () => {
      setFocusMode((current) => !current)
    },
    onExitFocusMode: () => {
      setFocusMode(false)
    },
    onCreateChapter: () => {
      void createChapter()
    },
    onToggleSidebar: () => {
      setSidebarVisible((visible) => !visible)
    },
    onToggleInspector: () => {
      setInspectorVisible((visible) => !visible)
    },
    onOpenQuickSearch: () => {
      setQuickSearchOpen(true)
    }
  })

  const searchTrigger = useMemo(
    () => ({
      onOpen: () => setQuickSearchOpen(true),
      shortcut: /mac/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'
    }),
    []
  )

  useEffect(() => {
    const documentMissing =
      selection.type === 'document' && !documents.some((document) => document.id === selection.id)

    const characterMissing =
      selection.type === 'character' &&
      !characters.some((character) => character.id === selection.id)

    const locationMissing =
      selection.type === 'location' && !locations.some((location) => location.id === selection.id)

    if (documentMissing || characterMissing || locationMissing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelection({ type: 'home' })
    }
  }, [documents, characters, locations, selection])

  const activeDocument =
    selection.type === 'document'
      ? documents.find((document) => document.id === selection.id)
      : undefined

  const activeChapter = activeDocument?.type === 'chapter' ? activeDocument : undefined

  const activeScene = activeDocument?.type === 'scene' ? activeDocument : undefined

  const activeCharacter =
    selection.type === 'character'
      ? characters.find((character) => character.id === selection.id)
      : undefined

  const activeLocation =
    selection.type === 'location'
      ? locations.find((location) => location.id === selection.id)
      : undefined

  const activeChapterScenes = activeChapter
    ? documents
        .filter((document) => document.type === 'scene' && document.parentId === activeChapter.id)
        .sort((first, second) => first.order - second.order)
    : []

  const sceneWordCount = activeScene ? getWordCount(activeScene.content) : 0

  const sceneCharacterCount = activeScene ? getCharacterCount(activeScene.content) : 0

  const chapterWordCount = activeChapter
    ? getWordCount(activeChapter.content) +
      activeChapterScenes.reduce((total, scene) => total + getWordCount(scene.content), 0)
    : 0

  const chapterCharacterCount = activeChapter
    ? getCharacterCount(activeChapter.content) +
      activeChapterScenes.reduce((total, scene) => total + getCharacterCount(scene.content), 0)
    : 0

  async function updateBook(field: BookEditableField, value: string | number) {
    if (!activeBookId) return

    await updateBookRecord(activeBookId, field, value)
  }

  async function updateDocument(
    field: keyof Pick<Chapter, 'title' | 'content' | 'notes'>,
    value: string
  ) {
    if (!activeDocument) return

    await updateDocumentRecord(activeDocument.id, field, value)
  }

  async function createChapter() {
    if (!activeBookId) return

    const chapter = await createChapterRecord(activeBookId, documents)

    setSelection({
      type: 'document',
      id: chapter.id
    })
  }

  async function createScene(parentChapterId: string) {
    if (!activeBookId) return

    const scene = await createSceneRecord(activeBookId, parentChapterId, documents)

    setSelection({
      type: 'document',
      id: scene.id
    })
  }

  async function deleteDocument(documentId: string) {
    const message = getDocumentDeletionMessage(documentId, documents)

    if (!message || !window.confirm(message)) {
      return
    }

    const deletedIds = await removeDocumentRecord(documentId, documents)

    if (selection.type === 'document' && deletedIds.has(selection.id)) {
      setSelection({ type: 'home' })
    }
  }

  async function reorderDocuments(documentIds: string[]) {
    await reorderDocumentRecords(documentIds)
  }

  async function moveScene(sceneId: string, targetChapterId: string) {
    await moveSceneRecord(sceneId, targetChapterId, documents)
  }

  async function createCharacter() {
    if (!activeBookId) return

    const character = await createCharacterRecord(activeBookId, characters.length)

    setSelection({
      type: 'character',
      id: character.id
    })
  }

  async function updateCharacter(field: CharacterEditableField, value: string) {
    if (!activeCharacter) return

    await updateCharacterRecord(activeCharacter.id, field, value)
  }

  async function commitCharacterName() {
    if (!activeCharacter) return

    await commitCharacterNameRecord(activeCharacter.id, activeCharacter.name)
  }

  async function deleteCharacter(characterId: string) {
    const character = characters.find((currentCharacter) => currentCharacter.id === characterId)

    if (!character) return

    const name = character.name || 'Personagem sem nome'

    const confirmed = window.confirm(
      `Excluir o personagem "${name}"?\n\n` +
        'As menções existentes permanecerão no texto, ' +
        'mas não abrirão mais a ficha.'
    )

    if (!confirmed) return

    await removeCharacterRecord(characterId)

    if (selection.type === 'character' && selection.id === characterId) {
      setSelection({ type: 'home' })
    }
  }

  async function createLocation() {
    if (!activeBookId) return

    const location = await createLocationRecord(activeBookId, locations.length)

    setSelection({
      type: 'location',
      id: location.id
    })
  }

  async function updateLocation(field: LocationEditableField, value: string) {
    if (!activeLocation) return

    await updateLocationRecord(activeLocation.id, field, value)
  }

  async function commitLocationName() {
    if (!activeLocation) return

    await commitLocationNameRecord(activeLocation.id, activeLocation.name)
  }

  async function deleteLocation(locationId: string) {
    const location = locations.find((currentLocation) => currentLocation.id === locationId)

    if (!location) return

    const name = location.name || 'Lugar sem nome'

    const confirmed = window.confirm(
      `Excluir o lugar "${name}"?\n\n` +
        'As menções existentes permanecerão no texto, ' +
        'mas não abrirão mais a ficha.'
    )

    if (!confirmed) return

    await removeLocationRecord(locationId)

    if (selection.type === 'location' && selection.id === locationId) {
      setSelection({ type: 'home' })
    }
  }

  function openReference(entityId: string) {
    if (characters.some((character) => character.id === entityId)) {
      setSelection({
        type: 'character',
        id: entityId
      })

      return
    }

    if (locations.some((location) => location.id === entityId)) {
      setSelection({
        type: 'location',
        id: entityId
      })
    }
  }

  if (loading || !book) {
    return <div className="app-loading">Carregando livro...</div>
  }

  const appClassName = [
    'app',
    !sidebarVisible ? 'sidebar-hidden' : '',
    !inspectorVisible ? 'inspector-hidden' : '',
    focusMode ? 'focus-mode' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <SearchTriggerContext.Provider value={searchTrigger}>
      <BookLibraryContext.Provider value={bookLibrary}>
        <HomeNavigationContext.Provider value={homeNavigation}>
          <div className="app-shell">
            <TitleBar />

            <div className={appClassName}>
              <QuickSearch
                open={quickSearchOpen}
                documents={documents}
                characters={characters}
                locations={locations}
                onClose={() => setQuickSearchOpen(false)}
                onSelect={(result) => {
                  setQuickSearchOpen(false)

                  if (result.type === 'document') {
                    setSelection({
                      type: 'document',
                      id: result.id
                    })
                    return
                  }

                  if (result.type === 'character') {
                    setSelection({
                      type: 'character',
                      id: result.id
                    })
                    return
                  }

                  setSelection({
                    type: 'location',
                    id: result.id
                  })
                }}
              />
              <button
                type="button"
                className="panel-toggle sidebar-panel-toggle"
                onClick={() => setSidebarVisible((visible) => !visible)}
                title={sidebarVisible ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
                aria-label={sidebarVisible ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
              >
                {sidebarVisible ? <ChevronsRight /> : <ChevronsLeft />}
              </button>
              <button
                type="button"
                className="panel-toggle inspector-panel-toggle"
                onClick={() => setInspectorVisible((visible) => !visible)}
                title={inspectorVisible ? 'Ocultar inspetor' : 'Mostrar inspetor'}
                aria-label={inspectorVisible ? 'Ocultar inspetor' : 'Mostrar inspetor'}
              >
                {inspectorVisible ? <ChevronsRight /> : <ChevronsLeft />}
              </button>
              <Sidebar
                homeActive={selection.type === 'home'}
                onSelectHome={() => setSelection({ type: 'home' })}
                bookTitle={book.title}
                chapters={documents}
                characters={characters}
                locations={locations}
                activeChapterId={selection.type === 'document' ? selection.id : null}
                activeCharacterId={selection.type === 'character' ? selection.id : null}
                activeLocationId={selection.type === 'location' ? selection.id : null}
                onSelectChapter={(id) =>
                  setSelection({
                    type: 'document',
                    id
                  })
                }
                onSelectCharacter={(id) =>
                  setSelection({
                    type: 'character',
                    id
                  })
                }
                onSelectLocation={(id) =>
                  setSelection({
                    type: 'location',
                    id
                  })
                }
                onCreateChapter={() => void createChapter()}
                onCreateScene={(chapterId) => void createScene(chapterId)}
                onDeleteDocument={(documentId) => void deleteDocument(documentId)}
                onCreateCharacter={() => void createCharacter()}
                onCreateLocation={() => void createLocation()}
                onReorderDocuments={(documentIds) => void reorderDocuments(documentIds)}
                onMoveScene={(sceneId, targetChapterId) => void moveScene(sceneId, targetChapterId)}
                onDeleteCharacter={(characterId) => void deleteCharacter(characterId)}
                onDeleteLocation={(locationId) => void deleteLocation(locationId)}
              />
              {selection.type === 'home' && (
                <>
                  <HomePage
                    book={book}
                    documents={documents}
                    onOpenChapter={(id) =>
                      setSelection({
                        type: 'document',
                        id
                      })
                    }
                    onCreateChapter={() => void createChapter()}
                    onUpdateBook={(field, value) => void updateBook(field, value)}
                  />

                  <aside className="inspector">
                    <div className="inspector-header">
                      <h2>Projeto</h2>
                    </div>

                    <div className="inspector-section">
                      <label>Capítulos</label>

                      <strong>
                        {
                          documents.filter(
                            (document) => document.type === 'chapter' && document.parentId === null
                          ).length
                        }
                      </strong>
                    </div>

                    <div className="inspector-section">
                      <label>Cenas</label>

                      <strong>
                        {documents.filter((document) => document.type === 'scene').length}
                      </strong>
                    </div>

                    <div className="inspector-section">
                      <label>Personagens</label>
                      <strong>{characters.length}</strong>
                    </div>

                    <div className="inspector-section">
                      <label>Lugares</label>
                      <strong>{locations.length}</strong>
                    </div>
                  </aside>
                </>
              )}
              {activeChapter && (
                <>
                  <ChapterOverview
                    chapter={activeChapter}
                    scenes={activeChapterScenes}
                    onOpenScene={(sceneId) =>
                      setSelection({
                        type: 'document',
                        id: sceneId
                      })
                    }
                    onCreateScene={() => void createScene(activeChapter.id)}
                    onDeleteScene={(sceneId) => void deleteDocument(sceneId)}
                    onReorderScenes={(sceneIds) => void reorderDocuments(sceneIds)}
                  />

                  <Inspector
                    chapter={activeChapter}
                    wordCount={chapterWordCount}
                    characterCount={chapterCharacterCount}
                    onUpdateNotes={(notes) => void updateDocument('notes', notes)}
                  />
                </>
              )}
              {activeScene && (
                <>
                  <Editor
                    key={activeScene.id}
                    chapter={activeScene}
                    characters={characters}
                    locations={locations}
                    wordCount={sceneWordCount}
                    onUpdate={(field, value) => updateDocument(field, value)}
                    onOpenReference={openReference}
                  />

                  <Inspector
                    chapter={activeScene}
                    wordCount={sceneWordCount}
                    characterCount={sceneCharacterCount}
                    onUpdateNotes={(notes) => void updateDocument('notes', notes)}
                  />
                </>
              )}
              {activeCharacter && (
                <>
                  <CharacterEditor
                    key={activeCharacter.id}
                    character={activeCharacter}
                    characters={characters}
                    locations={locations}
                    documents={documents}
                    onOpenDocument={(documentId) =>
                      setSelection({
                        type: 'document',
                        id: documentId
                      })
                    }
                    onUpdate={(field, value) => updateCharacter(field, value)}
                    onCommitName={() => commitCharacterName()}
                    onOpenReference={openReference}
                  />

                  <aside className="inspector">
                    <div className="inspector-header">
                      <h2>Referências</h2>
                    </div>

                    <div className="inspector-section">
                      <label>Como mencionar</label>

                      <strong className="reference-name">@{activeCharacter.name}</strong>
                    </div>
                  </aside>
                </>
              )}
              {activeLocation && (
                <>
                  <LocationEditor
                    key={activeLocation.id}
                    location={activeLocation}
                    documents={documents}
                    characters={characters}
                    locations={locations}
                    onUpdate={(field, value) => updateLocation(field, value)}
                    onCommitName={() => commitLocationName()}
                    onOpenDocument={(documentId) =>
                      setSelection({
                        type: 'document',
                        id: documentId
                      })
                    }
                    onOpenReference={openReference}
                  />

                  <aside className="inspector">
                    <div className="inspector-header">
                      <h2>Referências</h2>
                    </div>

                    <div className="inspector-section">
                      <label>Como mencionar</label>

                      <strong className="reference-name">#{activeLocation.name}</strong>
                    </div>
                  </aside>
                </>
              )}
              <Notice notice={notice} onDismiss={dismissNotice} />
            </div>
          </div>
        </HomeNavigationContext.Provider>
      </BookLibraryContext.Provider>
    </SearchTriggerContext.Provider>
  )
}

export default App
