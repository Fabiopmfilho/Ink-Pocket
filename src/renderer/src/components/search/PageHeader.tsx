import { useContext } from 'react'

import { Search } from 'lucide-react'

import { SearchTriggerContext } from './searchTriggerContext'

type PageHeaderProps = {
  title: string
}

function PageHeader({ title }: PageHeaderProps) {
  const searchTrigger = useContext(SearchTriggerContext)

  return (
    <header className="editor-header page-header">
      <span className="editor-header-title">{title}</span>

      {searchTrigger && (
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
