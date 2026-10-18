import { useContext } from 'react'

import { ChevronLeft, Search } from 'lucide-react'

import { HomeNavigationContext } from './HomeNavigationContext'
import { SearchTriggerContext } from './searchTriggerContext'

type PageHeaderProps = {
  title: string
  showHome?: boolean
}

function PageHeader({ title, showHome = true }: PageHeaderProps) {
  const searchTrigger = useContext(SearchTriggerContext)
  const homeNavigation = useContext(HomeNavigationContext)

  const showSearch = searchTrigger !== null && window.api.platform === 'darwin'

  return (
    <header className={showSearch ? 'editor-header page-header' : 'editor-header'}>
      <div className="editor-header-heading">
        {showHome && homeNavigation && (
          <button
            type="button"
            className="editor-header-home"
            onClick={homeNavigation.onGoHome}
            title="Voltar à visão geral"
            aria-label="Voltar à visão geral"
          >
            <ChevronLeft size={15} strokeWidth={1.75} aria-hidden="true" />

            <span>Visão geral</span>
          </button>
        )}

        <span className="editor-header-title">{title}</span>
      </div>

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
