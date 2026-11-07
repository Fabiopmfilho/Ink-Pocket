import { useId, useState } from 'react'

import { resolveCategory } from '../../utils/categories'

type CategoryFieldProps = {
  value: string
  options: string[]
  placeholder: string
  onChange: (category: string) => void
}

function CategoryField({ value, options, placeholder, onChange }: CategoryFieldProps) {
  const listId = useId()

  const [draft, setDraft] = useState<string | null>(null)

  function commit() {
    if (draft === null) {
      return
    }

    const resolved = resolveCategory(draft, options)

    setDraft(null)

    if (resolved !== value) {
      onChange(resolved)
    }
  }

  return (
    <label className="entity-form-field">
      <span>Categoria</span>

      <input
        value={draft ?? value}
        list={listId}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur()
          }
        }}
      />

      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  )
}

export default CategoryField
