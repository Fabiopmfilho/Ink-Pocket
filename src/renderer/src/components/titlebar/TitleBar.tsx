import { useContext, useEffect, useState, type MouseEvent } from 'react'
import appIcon from '../../../../../resources/icon2.png'

import { Search } from 'lucide-react'

import { SearchTriggerContext } from '../search/searchTriggerContext'

function TitleBar() {
  const isMac = window.api.platform === 'darwin'
  const searchTrigger = useContext(SearchTriggerContext)
  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {
    if (isMac) {
      return
    }

    let active = true

    window.api
      .getMenuLabels()
      .then((items) => {
        if (active) {
          setLabels(items)
        }
      })
      .catch((error: unknown) => {
        console.error('Não foi possível carregar os menus:', error)
      })

    return () => {
      active = false
    }
  }, [isMac])

  if (isMac) {
    return null
  }

  function openMenu(index: number, event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()

    void window.api.popupMenu(index, rect.left, rect.bottom)
  }

  return (
    <div className="title-bar">
      <div className="title-bar-start">
        <div className="title-bar-icon">
          <img src={appIcon} alt="" draggable={false} />
        </div>

        <nav className="title-bar-menu" aria-label="Menu do aplicativo">
          {labels.map((label, index) => (
            <button key={label} type="button" onClick={(event) => openMenu(index, event)}>
              {label}
            </button>
          ))}
        </nav>
      </div>

      {searchTrigger && (
        <button
          type="button"
          className="title-bar-search"
          onClick={searchTrigger.onOpen}
          title="Buscar no livro"
          aria-label="Buscar no livro"
          aria-haspopup="dialog"
        >
          <Search size={14} strokeWidth={1.75} aria-hidden="true" />

          <span className="title-bar-search-label">Buscar no livro…</span>

          {searchTrigger.shortcut && (
            <kbd className="title-bar-search-shortcut">{searchTrigger.shortcut}</kbd>
          )}
        </button>
      )}
    </div>
  )
}

export default TitleBar
