import { Trash } from 'lucide-react'
import { ReactNode } from 'react'

type EntityListItem = {
  id: string
  name: string
}

type EntityListProps<T extends EntityListItem> = {
  items: T[]
  activeItemId: string | null
  icon: ReactNode
  emptyMessage: string
  fallbackName: string
  deleteTitle: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function EntityList<T extends EntityListItem>({
  items,
  activeItemId,
  icon,
  emptyMessage,
  fallbackName,
  deleteTitle,
  onSelect,
  onDelete
}: EntityListProps<T>) {
  if (items.length === 0) {
    return <p className="sidebar-empty">{emptyMessage}</p>
  }

  return (
    <div className="chapters">
      {items.map((item) => {
        const name = item.name || fallbackName

        return (
          <div key={item.id} className="entity-row">
            <button
              type="button"
              className={`chapter entity-title ${item.id === activeItemId ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <span>{icon}</span>
              <span>{name}</span>
            </button>

            <button
              type="button"
              className="document-delete-button"
              onClick={() => onDelete(item.id)}
              title={deleteTitle}
              aria-label={`${deleteTitle}: ${name}`}
            >
              <Trash size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default EntityList
