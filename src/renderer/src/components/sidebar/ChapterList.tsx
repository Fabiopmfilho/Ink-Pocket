import { useRef, useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'

import type { Chapter } from '../../types/book'
import { FileText, GripVertical, Plus, Trash } from 'lucide-react'

type ChapterListProps = {
  chapters: Chapter[]
  activeChapterId: string
  onSelectChapter: (id: string) => void
  onCreateScene: (chapterId: string) => void
  onDeleteDocument: (id: string) => void
  onReorderDocuments: (documentIds: string[]) => void
  onMoveScene: (sceneId: string, targetChapterId: string) => void
}

type SortableSceneProps = {
  scene: Chapter
  index: number
  parentChapterId: string
  activeChapterId: string
  fallbackTitle: string
  onSelect: () => void
  onDelete: () => void
}

function SortableScene({
  scene,
  index,
  parentChapterId,
  activeChapterId,
  fallbackTitle,
  onSelect,
  onDelete
}: SortableSceneProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: scene.id,
    index,
    group: parentChapterId,
    type: 'scene',
    accept: 'scene'
  })

  return (
    <div ref={ref} className={`scene-row ${isDragging ? 'dragging' : ''}`}>
      <button
        ref={handleRef}
        type="button"
        className="document-drag-handle"
        title="Arrastar cena"
        aria-label={`Reordenar ${scene.title || fallbackTitle}`}
      >
        ⠿
      </button>

      <button
        type="button"
        className={`chapter scene ${scene.id === activeChapterId ? 'active' : ''}`}
        onClick={onSelect}
      >
        <span>◦</span>
        <span>{scene.title || fallbackTitle}</span>
      </button>

      <button
        type="button"
        className="document-delete-button"
        onClick={onDelete}
        title="Excluir cena"
        aria-label={`Excluir ${scene.title || fallbackTitle}`}
      >
        <Trash size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )
}

type SortableChapterProps = {
  chapter: Chapter
  index: number
  scenes: Chapter[]
  expanded: boolean
  activeChapterId: string
  fallbackTitle: string
  onToggle: () => void
  onSelect: () => void
  onSelectDocument: (id: string) => void
  onCreateScene: () => void
  onDeleteDocument: (id: string) => void
}

function SortableChapter({
  chapter,
  index,
  scenes,
  expanded,
  activeChapterId,
  fallbackTitle,
  onToggle,
  onSelect,
  onSelectDocument,
  onCreateScene,
  onDeleteDocument
}: SortableChapterProps) {
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: chapter.id,
    index,
    group: 'root-chapters',
    type: 'chapter',
    accept: ['chapter', 'scene']
  })

  const className = [
    'document-group',
    isDragging ? 'dragging' : '',
    isDropTarget ? 'drop-target' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={className}>
      <div className="document-row">
        <button
          ref={handleRef}
          type="button"
          className="document-drag-handle"
          title="Arrastar capítulo"
          aria-label={`Reordenar ${chapter.title || fallbackTitle}`}
        >
          <GripVertical size={26} />
        </button>

        <button
          type="button"
          className="chapter-toggle"
          onClick={onToggle}
          title={expanded ? 'Recolher capítulo' : 'Expandir capítulo'}
          aria-expanded={expanded}
        >
          {expanded ? '▾' : '▸'}
        </button>

        <button
          type="button"
          className={`chapter document-title ${chapter.id === activeChapterId ? 'active' : ''}`}
          onClick={onSelect}
        >
          <span>
            <FileText size={12} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span>{chapter.title || fallbackTitle}</span>
        </button>

        <button
          type="button"
          className="document-delete-button"
          onClick={() => onDeleteDocument(chapter.id)}
          title="Excluir capítulo"
          aria-label={`Excluir ${chapter.title || fallbackTitle}`}
        >
          <Trash size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="document-add-button"
          onClick={onCreateScene}
          title="Nova cena"
          aria-label={`Criar cena em ${chapter.title || fallbackTitle}`}
        >
          <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div className="scene-list">
          {scenes.map((scene, sceneIndex) => (
            <SortableScene
              key={scene.id}
              scene={scene}
              index={sceneIndex}
              parentChapterId={chapter.id}
              activeChapterId={activeChapterId}
              fallbackTitle={`Cena ${sceneIndex + 1}`}
              onSelect={() => onSelectDocument(scene.id)}
              onDelete={() => onDeleteDocument(scene.id)}
            />
          ))}

          {scenes.length === 0 && <p className="scene-empty">Nenhuma cena</p>}
        </div>
      )}
    </div>
  )
}

function ChapterList({
  chapters,
  activeChapterId,
  onSelectChapter,
  onCreateScene,
  onDeleteDocument,
  onReorderDocuments,
  onMoveScene
}: ChapterListProps) {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null)

  const targetChapterIdRef = useRef<string | null>(null)

  const rootChapters = chapters
    .filter((document) => document.type === 'chapter' && document.parentId === null)
    .sort((first, second) => first.order - second.order)

  function toggleChapter(chapterId: string) {
    setExpandedChapterId((currentId) => (currentId === chapterId ? null : chapterId))
  }

  function reorderGroup(
    group: string | number | undefined,
    initialIndex: number,
    finalIndex: number
  ) {
    if (initialIndex === finalIndex || group === undefined) {
      return
    }

    const groupDocuments =
      group === 'root-chapters'
        ? rootChapters
        : chapters
            .filter((document) => document.type === 'scene' && document.parentId === group)
            .sort((first, second) => first.order - second.order)

    const reorderedDocuments = [...groupDocuments]
    const [movedDocument] = reorderedDocuments.splice(initialIndex, 1)

    if (!movedDocument) return

    reorderedDocuments.splice(finalIndex, 0, movedDocument)

    onReorderDocuments(reorderedDocuments.map((document) => document.id))
  }

  return (
    <DragDropProvider
      onDragStart={() => {
        targetChapterIdRef.current = null
      }}
      onDragOver={(event) => {
        const sourceId = event.operation.source?.id
        const targetId = event.operation.target?.id

        const sourceDocument = chapters.find((document) => document.id === sourceId)

        const targetDocument = chapters.find((document) => document.id === targetId)

        if (sourceDocument?.type === 'scene' && targetDocument?.type === 'chapter') {
          targetChapterIdRef.current = targetDocument.id
          event.preventDefault()
          return
        }

        targetChapterIdRef.current = null
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          targetChapterIdRef.current = null
          return
        }

        const { source } = event.operation

        if (!isSortable(source)) {
          targetChapterIdRef.current = null
          return
        }

        const draggedDocument = chapters.find((document) => document.id === source.id)

        const targetChapterId = targetChapterIdRef.current
        targetChapterIdRef.current = null

        if (
          draggedDocument?.type === 'scene' &&
          targetChapterId &&
          draggedDocument.parentId !== targetChapterId
        ) {
          setExpandedChapterId(targetChapterId)

          onMoveScene(draggedDocument.id, targetChapterId)

          return
        }

        if (source.initialGroup !== source.group) {
          return
        }

        reorderGroup(source.initialGroup, source.initialIndex, source.index)
      }}
    >
      <div className="chapters">
        {rootChapters.map((chapter, chapterIndex) => {
          const scenes = chapters
            .filter((document) => document.type === 'scene' && document.parentId === chapter.id)
            .sort((first, second) => first.order - second.order)

          const expanded = expandedChapterId === chapter.id

          return (
            <SortableChapter
              key={chapter.id}
              chapter={chapter}
              index={chapterIndex}
              scenes={scenes}
              expanded={expanded}
              activeChapterId={activeChapterId}
              fallbackTitle={`Capítulo ${chapterIndex + 1}`}
              onToggle={() => toggleChapter(chapter.id)}
              onSelect={() => onSelectChapter(chapter.id)}
              onSelectDocument={onSelectChapter}
              onCreateScene={() => {
                setExpandedChapterId(chapter.id)
                onCreateScene(chapter.id)
              }}
              onDeleteDocument={onDeleteDocument}
            />
          )
        })}
      </div>
    </DragDropProvider>
  )
}

export default ChapterList
