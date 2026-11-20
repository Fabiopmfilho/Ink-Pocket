import { ChevronRight, Trash } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'

import { getCategoryColor, groupByCategory } from '../../utils/categories'

type EntityListItem = {
  id: string
  name: string
  category?: string
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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())

  if (items.length === 0) {
    return <p className="sidebar-empty">{emptyMessage}</p>
  }

  const groups = groupByCategory(items)

  const hasCategories = groups.some((group) => group.category !== null)

  function toggleGroup(key: string) {
    setCollapsedGroups((current) => {
      const next = new Set(current)

      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }

      return next
    })
  }

  function renderRow(item: T) {
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
  }

  if (!hasCategories) {
    return <div className="chapters">{items.map(renderRow)}</div>
  }

  return (
    <div className="chapters">
      {groups.map((group) => {
        const collapsed = collapsedGroups.has(group.key)

        const groupStyle =
          group.category === null
            ? undefined
            : ({ '--group-color': getCategoryColor(group.key) } as CSSProperties)

        return (
          <section key={group.key} className="entity-group" style={groupStyle}>
            <button
              type="button"
              className="entity-group-header"
              aria-expanded={!collapsed}
              onClick={() => toggleGroup(group.key)}
            >
              <ChevronRight
                size={12}
                strokeWidth={2}
                className="entity-group-chevron"
                aria-hidden="true"
              />

              <span className="entity-group-dot" aria-hidden="true" />

              <span className="entity-group-name">{group.label}</span>

              <span className="entity-group-count">{group.items.length}</span>
            </button>

            {!collapsed && group.items.map(renderRow)}
          </section>
        )
      })}
    </div>
  )
}

export default EntityList
