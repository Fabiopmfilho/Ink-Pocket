import { useEffect, useRef, useState } from 'react'

import type { Editor } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
  type LucideIcon
} from 'lucide-react'

export type TextAlignValue = 'left' | 'center' | 'right' | 'justify'

type AlignOption = {
  value: TextAlignValue
  label: string
  shortcut: string
  Icon: LucideIcon
}

const leftOption: AlignOption = {
  value: 'left',
  label: 'Alinhar à esquerda',
  shortcut: 'Ctrl+Shift+L',
  Icon: AlignLeft
}

const alignOptions: AlignOption[] = [
  leftOption,
  { value: 'center', label: 'Centralizar', shortcut: 'Ctrl+Shift+E', Icon: AlignCenter },
  { value: 'right', label: 'Alinhar à direita', shortcut: 'Ctrl+Shift+R', Icon: AlignRight },
  { value: 'justify', label: 'Justificar', shortcut: 'Ctrl+Shift+J', Icon: AlignJustify }
]

type AlignMenuProps = {
  editor: Editor
  value: TextAlignValue
}

function AlignMenu({ editor, value }: AlignMenuProps) {
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

  const current = alignOptions.find((option) => option.value === value) ?? leftOption
  const CurrentIcon = current.Icon

  function chooseAlignment(alignment: TextAlignValue) {
    editor.chain().focus().setTextAlign(alignment).run()
    setOpen(false)
  }

  return (
    <div className="align-menu" ref={rootRef}>
      <button
        type="button"
        className={`align-menu-trigger${open ? ' active' : ''}`}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        title={`Alinhamento: ${current.label}`}
        aria-label="Alinhamento"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <CurrentIcon size={18} strokeWidth={1.75} aria-hidden="true" />

        <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div className="align-menu-popover" role="menu" aria-label="Alinhamento">
          {alignOptions.map(({ value: optionValue, label, shortcut, Icon }) => (
            <button
              key={optionValue}
              type="button"
              role="menuitemradio"
              aria-checked={optionValue === value}
              className={optionValue === value ? 'active' : ''}
              title={`${label} (${shortcut})`}
              aria-label={label}
              onClick={() => chooseAlignment(optionValue)}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlignMenu
