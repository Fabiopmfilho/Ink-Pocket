import { useEffect, useMemo, useRef, useState } from 'react'

interface SearchDocument {
  id: string
  title: string
  type: string
  parentId: string | null
}

interface SearchEntity {
  id: string
  name: string
}

interface SearchResult {
  id: string
  label: string
  description: string
  type: 'document' | 'character' | 'location'
}

interface QuickSearchProps {
  open: boolean
  documents: SearchDocument[]
  characters: SearchEntity[]
  locations: SearchEntity[]
  onClose: () => void
  onSelect: (result: SearchResult) => void
}

function QuickSearchDialog({
  documents,
  characters,
  locations,
  onClose,
  onSelect
}: Omit<QuickSearchProps, 'open'>) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo<SearchResult[]>(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

    if (!normalizedQuery) return []

    const documentResults: SearchResult[] = documents.map((document) => ({
      id: document.id,
      label: document.title || 'Documento sem título',
      description: document.type === 'scene' ? 'Cena' : 'Capítulo',
      type: 'document'
    }))

    const characterResults: SearchResult[] = characters.map((character) => ({
      id: character.id,
      label: character.name || 'Personagem sem nome',
      description: 'Personagem',
      type: 'character'
    }))

    const locationResults: SearchResult[] = locations.map((location) => ({
      id: location.id,
      label: location.name || 'Lugar sem nome',
      description: 'Lugar',
      type: 'location'
    }))

    return [...documentResults, ...characterResults, ...locationResults]
      .filter((result) => result.label.toLocaleLowerCase('pt-BR').includes(normalizedQuery))
      .slice(0, 50)
  }, [query, documents, characters, locations])

  const selectedIndex = Math.min(activeIndex, results.length - 1)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key === 'ArrowDown' && results.length > 0) {
        event.preventDefault()
        setActiveIndex((current) => (current + 1) % results.length)
        return
      }

      if (event.key === 'ArrowUp' && results.length > 0) {
        event.preventDefault()
        setActiveIndex((current) => (current - 1 + results.length) % results.length)
        return
      }

      if (event.key === 'Enter' && results.length > 0) {
        event.preventDefault()
        onSelect(results[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [results, activeIndex, onClose, onSelect, selectedIndex])

  return (
    <div className="quick-search-backdrop" onMouseDown={onClose}>
      <section
        className="quick-search"
        role="dialog"
        aria-modal="true"
        aria-label="Busca rápida"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="quick-search-input-wrap">
          <span className="quick-search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            ref={inputRef}
            className="quick-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar capítulos, cenas, personagens e lugares..."
            aria-label="Buscar no projeto"
          />

          <button
            type="button"
            className="quick-search-close"
            onClick={onClose}
            aria-label="Fechar busca"
            title="Fechar"
          >
            Esc
          </button>
        </div>

        <div className="quick-search-results">
          {!query.trim() && (
            <p className="quick-search-empty">Digite um nome para buscar no projeto.</p>
          )}

          {query.trim() && results.length === 0 && (
            <p className="quick-search-empty">Nenhum resultado encontrado.</p>
          )}

          {results.map((result, index) => (
            <button
              type="button"
              key={`${result.type}-${result.id}`}
              className={`quick-search-result ${index === selectedIndex ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => onSelect(result)}
            >
              <span className="quick-search-result-label">{result.label}</span>

              <span className="quick-search-result-type">{result.description}</span>
            </button>
          ))}
        </div>

        <footer className="quick-search-footer">
          <span>↑ ↓ navegar</span>
          <span>Enter abrir</span>
          <span>Esc fechar</span>
        </footer>
      </section>
    </div>
  )
}

function QuickSearch(props: QuickSearchProps) {
  if (!props.open) return null

  return <QuickSearchDialog {...props} />
}

export default QuickSearch
