import { useContext } from 'react'

import { ChevronRight, Search } from 'lucide-react'

import { HomeNavigationContext } from './HomeNavigationContext'
import { SearchTriggerContext } from './searchTriggerContext'

type PageHeaderProps = {
  title: string
  showHome?: boolean
  parent?: {
    title: string
    onOpen: () => void
  }
}

function PageHeader({ title, showHome = true, parent }: PageHeaderProps) {
  const searchTrigger = useContext(SearchTriggerContext)
  const homeNavigation = useContext(HomeNavigationContext)

  const showSearch = searchTrigger !== null && window.api.platform === 'darwin'

  return (
    <header className={showSearch ? 'editor-header page-header' : 'editor-header'}>
      <nav className="editor-header-heading" aria-label="Caminho de navegação">
        {showHome && homeNavigation && (
          <>
            <button
              type="button"
              className="editor-header-crumb"
              onClick={homeNavigation.onGoHome}
              title="Voltar à visão geral"
            >
              Visão geral
            </button>

            <ChevronRight
              size={14}
              strokeWidth={1.75}
              className="editor-header-separator"
              aria-hidden="true"
            />
          </>
        )}

        {parent && (
          <>
            <button
              type="button"
              className="editor-header-crumb"
              onClick={parent.onOpen}
              title={`Abrir ${parent.title}`}
            >
              {parent.title}
            </button>

            <ChevronRight
              size={14}
              strokeWidth={1.75}
              className="editor-header-separator"
              aria-hidden="true"
            />
          </>
        )}

        <span className="editor-header-title" aria-current="page">
          {title}
        </span>
      </nav>

      {showSearch && (
        <button
          type="button"
          className="header-search-trigger"
          onClick={searchTrigger.onOpen}
          title="Buscar no livro"
          aria-label="Buscar no livro"
          aria-haspopup="dialog"
        >
          <Search size={15} strokeWidth={1.75} aria-hidden="true" />

          <span className="header-search-placeholder">Buscar no livro…</span>

          {searchTrigger.shortcut && (
            <kbd className="header-search-shortcut">{searchTrigger.shortcut}</kbd>
          )}
        </button>
      )}
    </header>
  )
}

export default PageHeader
