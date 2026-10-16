import { useEffect, useRef, useState } from 'react'

import type { Editor } from '@tiptap/react'

const colorPalette = [
  { label: 'Preto', value: '#1a1a1a' },
  { label: 'Cinza escuro', value: '#555555' },
  { label: 'Cinza', value: '#8a8a85' },
  { label: 'Vermelho', value: '#c0392b' },
  { label: 'Laranja', value: '#d97706' },
  { label: 'Amarelo', value: '#ca8a04' },
  { label: 'Verde', value: '#2e7d32' },
  { label: 'Azul', value: '#1e66c8' },
  { label: 'Roxo', value: '#55458a' },
  { label: 'Rosa', value: '#c2185b' }
]

type ColorPickerProps = {
  editor: Editor
  value: string
}

function ColorPicker({ editor, value }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const applyColor = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setOpen(false)
  }

  const resetColor = () => {
    editor.chain().focus().unsetColor().run()
    setOpen(false)
  }

  return (
    <div className="color-picker" ref={rootRef}>
      <button
        type="button"
        className={`color-picker-trigger${open ? ' active' : ''}`}
        onClick={() => setOpen((current) => !current)}
        title="Cor do texto"
        aria-label="Cor do texto"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="color-picker-letter" aria-hidden="true">
          A
        </span>
        <span
          className="color-picker-bar"
          style={{ backgroundColor: value || 'currentColor' }}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="color-picker-popover" role="dialog" aria-label="Cor do texto">
          <span className="color-picker-title">Cor do texto</span>

          <div className="color-picker-grid">
            {colorPalette.map((color) => (
              <button
                key={color.value}
                type="button"
                className="color-picker-swatch"
                style={{ backgroundColor: color.value }}
                title={color.label}
                aria-label={color.label}
                aria-pressed={value.toLowerCase() === color.value}
                onClick={() => applyColor(color.value)}
              />
            ))}
          </div>

          <label className="color-picker-custom">
            <span>Personalizada</span>
            <input
              type="color"
              value={value || '#000000'}
              aria-label="Escolher outra cor"
              onChange={(event) => editor.chain().setColor(event.target.value).run()}
            />
          </label>

          <button type="button" className="color-picker-reset" onClick={resetColor}>
            Restaurar cor padrão
          </button>
        </div>
      )}
    </div>
  )
}

export default ColorPicker
