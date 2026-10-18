import { useSortable } from '@dnd-kit/react/sortable'

import type { Chapter } from '../../types/book'
import { GripVertical, Trash2 } from 'lucide-react'

type SortableSceneCardProps = {
  scene: Chapter
  index: number
  chapterId: string
  onOpen: () => void
  onDelete: () => void
}

function getTextPreview(content: string): string {
  const text =
    new DOMParser()
      .parseFromString(content, 'text/html')
      .body.textContent?.replace(/\s+/g, ' ')
      .trim() ?? ''

  if (!text) {
    return 'Esta cena ainda não possui texto.'
  }

  return text.length > 150 ? `${text.slice(0, 150)}…` : text
}

function getWordCount(content: string): number {
  const text = new DOMParser().parseFromString(content, 'text/html').body.textContent?.trim() ?? ''

  return text ? text.split(/\s+/).length : 0
}

function SortableSceneCard({ scene, index, chapterId, onOpen, onDelete }: SortableSceneCardProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: scene.id,
    index,
    group: chapterId,
    type: 'chapter-scene',
    accept: 'chapter-scene'
  })

  return (
    <article ref={ref} className={`scene-board-card ${isDragging ? 'dragging' : ''}`}>
      <header>
        <span>Cena {index + 1}</span>

        <div className="scene-board-card-actions">
          <button
            ref={handleRef}
            type="button"
            className="scene-card-drag-handle"
            title="Arrastar cena"
            aria-label={`Reordenar ${scene.title || `Cena ${index + 1}`}`}
          >
            <GripVertical size={14} />
          </button>

          <button
            type="button"
            className="scene-card-delete"
            onClick={onDelete}
            title="Excluir cena"
            aria-label={`Excluir ${scene.title || `Cena ${index + 1}`}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </header>

      <button type="button" className="scene-board-card-content" onClick={onOpen}>
        <strong>{scene.title || `Cena ${index + 1}`}</strong>

        <p>{getTextPreview(scene.content)}</p>

        <footer>{getWordCount(scene.content).toLocaleString('pt-BR')} palavras</footer>
      </button>
    </article>
  )
}

export default SortableSceneCard
