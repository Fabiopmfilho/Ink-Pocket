import type { BookEditableField, BookRecord } from '../../database/models'

type BookSettingsProps = {
  book: BookRecord
  onUpdate: (field: BookEditableField, value: string | number) => void | Promise<void>
  onBack: () => void
}

function BookSettings({ book, onUpdate, onBack }: BookSettingsProps) {
  return (
    <div className="book-settings">
      <div className="book-settings-heading">
        <div>
          <h1>Configurações do livro</h1>
          <p>Informações gerais utilizadas no projeto e nas futuras exportações.</p>
        </div>

        <button type="button" className="secondary-button" onClick={onBack}>
          Voltar
        </button>
      </div>

      <div className="book-settings-form">
        <label className="entity-form-field book-title-field">
          <span>Título</span>

          <input
            value={book.title}
            onChange={(event) => {
              void onUpdate('title', event.target.value)
            }}
            placeholder="Título do livro"
          />
        </label>

        <label className="entity-form-field">
          <span>Subtítulo</span>

          <input
            value={book.subtitle}
            onChange={(event) => {
              void onUpdate('subtitle', event.target.value)
            }}
            placeholder="Subtítulo opcional"
          />
        </label>

        <label className="entity-form-field">
          <span>Autor</span>

          <input
            value={book.author}
            onChange={(event) => {
              void onUpdate('author', event.target.value)
            }}
            placeholder="Nome do autor"
          />
        </label>

        <label className="entity-form-field">
          <span>Gênero</span>

          <input
            value={book.genre}
            onChange={(event) => {
              void onUpdate('genre', event.target.value)
            }}
            placeholder="Fantasia, romance, suspense..."
          />
        </label>

        <label className="entity-form-field">
          <span>Idioma</span>

          <input
            value={book.language}
            onChange={(event) => {
              void onUpdate('language', event.target.value)
            }}
            placeholder="Português"
          />
        </label>

        <label className="entity-form-field">
          <span>Série</span>

          <input
            value={book.seriesName}
            onChange={(event) => {
              void onUpdate('seriesName', event.target.value)
            }}
            placeholder="Nome da série, se houver"
          />
        </label>

        <label className="entity-form-field">
          <span>Volume</span>

          <input
            value={book.volumeNumber}
            onChange={(event) => {
              void onUpdate('volumeNumber', event.target.value)
            }}
            placeholder="Ex.: 1"
          />
        </label>

        <label className="entity-form-field">
          <span>Meta total de palavras</span>

          <input
            type="number"
            min="0"
            step="1000"
            value={book.targetWordCount || ''}
            onChange={(event) => {
              const value = Number(event.target.value)

              void onUpdate('targetWordCount', Number.isFinite(value) ? value : 0)
            }}
            placeholder="Ex.: 80000"
          />
        </label>

        <label className="entity-form-field book-synopsis-field">
          <span>Sinopse</span>

          <textarea
            value={book.synopsis}
            onChange={(event) => {
              void onUpdate('synopsis', event.target.value)
            }}
            placeholder="Escreva uma breve sinopse do livro..."
          />
        </label>

        <button type="button" className="primary-button" onClick={onBack}>
          Salvar
        </button>
      </div>
    </div>
  )
}

export default BookSettings
