import { Fragment, useState } from 'react'

import { DragDropProvider } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'

import type { Chapter } from '../../types/book'

import SortableSceneCard from './SortableSceneCard'
import { getWordCount } from '../../utils/textStats'
import PageHeader from '../search/PageHeader'

type ChapterView = 'board' | 'compiled'

type ChapterOverviewProps = {
  chapter: Chapter
  scenes: Chapter[]
  onOpenScene: (sceneId: string) => void
  onCreateScene: () => void
  onDeleteScene: (sceneId: string) => void
  onReorderScenes: (sceneIds: string[]) => void
}

function ChapterOverview({
  chapter,
  scenes,
  onOpenScene,
  onCreateScene,
  onDeleteScene,
  onReorderScenes
}: ChapterOverviewProps) {
  const [view, setView] = useState<ChapterView>('board')

  const orderedScenes = [...scenes].sort((first, second) => first.order - second.order)

  const totalWords =
    getWordCount(chapter.content) +
    orderedScenes.reduce((total, scene) => total + getWordCount(scene.content), 0)

  function reorderScenes(initialIndex: number, finalIndex: number) {
    if (initialIndex === finalIndex) return

    const reorderedScenes = [...orderedScenes]
    const [movedScene] = reorderedScenes.splice(initialIndex, 1)

    if (!movedScene) return

    reorderedScenes.splice(finalIndex, 0, movedScene)

    onReorderScenes(reorderedScenes.map((scene) => scene.id))
  }

  return (
    <main className="chapter-overview">
      <PageHeader title={chapter.title || 'Capítulo sem título'} />

      <div className="chapter-overview-content">
        <div className="chapter-overview-heading">
          <div>
            <span className="chapter-overview-label">Capítulo</span>

            <h1>{chapter.title || 'Capítulo sem título'}</h1>

            <p>
              {orderedScenes.length} {orderedScenes.length === 1 ? 'cena' : 'cenas'}
              {' · '}
              {totalWords.toLocaleString('pt-BR')} palavras
            </p>
          </div>

          <div className="chapter-overview-actions">
            <button
              type="button"
              className={view === 'board' ? 'active' : ''}
              onClick={() => setView('board')}
            >
              Quadro
            </button>

            <button
              type="button"
              className={view === 'compiled' ? 'active' : ''}
              onClick={() => setView('compiled')}
              disabled={orderedScenes.length === 0}
            >
              Ler capítulo completo
            </button>

            <button type="button" className="primary-button" onClick={onCreateScene}>
              Nova cena
            </button>
          </div>
        </div>

        {view === 'board' && (
          <>
            {orderedScenes.length > 0 ? (
              <DragDropProvider
                onDragEnd={(event) => {
                  if (event.canceled) return

                  const { source } = event.operation

                  if (!isSortable(source)) return

                  if (source.initialGroup !== source.group) {
                    return
                  }

                  reorderScenes(source.initialIndex, source.index)
                }}
              >
                <div className="scene-board-scroll">
                  <div className="scene-board">
                    {orderedScenes.map((scene, index) => (
                      <Fragment key={scene.id}>
                        <SortableSceneCard
                          scene={scene}
                          index={index}
                          chapterId={chapter.id}
                          onOpen={() => onOpenScene(scene.id)}
                          onDelete={() => onDeleteScene(scene.id)}
                        />

                        {index < orderedScenes.length - 1 && (
                          <span className="scene-board-arrow" aria-hidden="true">
                            →
                          </span>
                        )}
                      </Fragment>
                    ))}

                    <span className="scene-board-arrow" aria-hidden="true">
                      →
                    </span>

                    <button type="button" className="scene-board-add" onClick={onCreateScene}>
                      <span>+</span>
                      Nova cena
                    </button>
                  </div>
                </div>
              </DragDropProvider>
            ) : (
              <div className="chapter-scenes-empty">
                <h2>Este capítulo ainda não possui cenas</h2>

                <p>Crie a primeira cena para começar a escrever este capítulo.</p>

                <button type="button" onClick={onCreateScene}>
                  Criar primeira cena
                </button>
              </div>
            )}

            {chapter.content.trim() && (
              <div className="chapter-legacy-warning">
                <strong>Este capítulo possui texto escrito diretamente nele.</strong>

                <p>
                  O texto foi preservado, mas ainda não faz parte dos cards de cenas. Depois
                  criaremos a opção para movê-lo para uma cena.
                </p>
              </div>
            )}
          </>
        )}

        {view === 'compiled' && (
          <div className="compiled-chapter">
            <header>
              <span>Capítulo completo</span>
              <h2>{chapter.title || 'Capítulo sem título'}</h2>
            </header>

            {orderedScenes.map((scene, index) => (
              <section key={scene.id} className="compiled-scene">
                <div className="compiled-scene-heading">
                  <span>Cena {index + 1}</span>
                  <h3>{scene.title || `Cena ${index + 1}`}</h3>
                </div>

                <div
                  className="compiled-scene-content"
                  dangerouslySetInnerHTML={{
                    __html: scene.content || '<p></p>'
                  }}
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default ChapterOverview
