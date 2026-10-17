import { BookRecord, BookEditableField } from '@renderer/database/models'

import BookSettings from './BookSettings'

import { Chapter } from '@renderer/types/book'
import { useState } from 'react'

import { getWordCount } from '@renderer/utils/textStats'
import PageHeader from '../search/PageHeader'

type HomePageProps = {
  book: BookRecord
  documents: Chapter[]
  onOpenChapter: (id: string) => void
  onCreateChapter: () => void
  onUpdateBook: (field: BookEditableField, value: string | number) => void | Promise<void>
}

function HomePage({
  book,
  documents,
  onOpenChapter,
  onCreateChapter,
  onUpdateBook
}: HomePageProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const chapters = documents
    .filter((document) => document.type === 'chapter' && document.parentId === null)
    .sort((first, second) => first.order - second.order)

  if (settingsOpen) {
    return (
      <main className="home-area">
        <PageHeader title="Configurações do projeto" />

        <div className="home-content">
          <div className="home-content">
            <BookSettings
              book={book}
              onUpdate={onUpdateBook}
              onBack={() => setSettingsOpen(false)}
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="home-area">
      <PageHeader title="Visão geral" />

      <div className="home-content">
        <div className="home-heading">
          <div>
            <h1>{book.title || 'Livro sem título'}</h1>

            <p>{book.subtitle || 'Organize e acompanhe o progresso do seu livro.'}</p>
          </div>

          <div className="home-heading-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setSettingsOpen(true)}
            >
              Configurações
            </button>

            <button type="button" onClick={onCreateChapter}>
              Novo capítulo
            </button>
          </div>
        </div>

        {chapters.length > 0 ? (
          <div className="chapter-board">
            {chapters.map((chapter, index) => {
              const scenes = documents.filter(
                (document) => document.type === 'scene' && document.parentId === chapter.id
              )

              const chapterWords =
                getWordCount(chapter.content) +
                scenes.reduce((total, scene) => total + getWordCount(scene.content), 0)

              return (
                <button
                  key={chapter.id}
                  type="button"
                  className={`chapter-card color-${index % 4}`}
                  onClick={() => onOpenChapter(chapter.id)}
                >
                  <span className="chapter-card-number">Capítulo {index + 1}</span>

                  <strong>{chapter.title || `Capítulo ${index + 1}`}</strong>

                  <p>{chapter.notes.trim() || 'Nenhuma anotação adicionada.'}</p>

                  <footer>
                    <span>
                      {scenes.length} {scenes.length === 1 ? 'cena' : 'cenas'}
                    </span>

                    <span>{chapterWords.toLocaleString('pt-BR')} palavras</span>
                  </footer>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="home-empty">
            <h2>Comece seu manuscrito</h2>

            <p>Crie o primeiro capítulo para começar a escrever.</p>

            <button type="button" onClick={onCreateChapter}>
              Criar capítulo
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default HomePage
