import type { ReactNode } from 'react'

import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import {
  Bold,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2
} from 'lucide-react'

import AlignMenu, { type TextAlignValue } from './AlignMenu'
import ColorPicker from './ColorPicker'
import {
  editorFontFamilies,
  editorFontSizes,
  findFontOption,
  firstFontFamily,
  fontDisplayName,
  type SelectOption
} from './editorFonts'
import { getEffectiveTextStyle } from './editorTextStyle'

type EditorToolbarProps = {
  editor: Editor | null
}

type ToolbarButtonProps = {
  label: string
  shortcut?: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

type ToolbarSelectProps = {
  label: string
  className: string
  value: string
  options: SelectOption[]
  resetLabel?: string
  previewFonts?: boolean
  onChange: (value: string) => void
  onReset?: () => void
}

type BlockStyle = 'paragraph' | 'h1' | 'h2' | 'h3'

const iconProps = { size: 18, strokeWidth: 1.75, 'aria-hidden': true } as const

const RESET_VALUE = '__reset__'

const blockStyleOptions: SelectOption[] = [
  { label: 'Parágrafo', value: 'paragraph' },
  { label: 'Título 1', value: 'h1' },
  { label: 'Título 2', value: 'h2' },
  { label: 'Título 3', value: 'h3' }
]

function ToolbarButton({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={active ? 'active' : ''}
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function ToolbarSelect({
  label,
  className,
  value,
  options,
  resetLabel,
  previewFonts = false,
  onChange,
  onReset
}: ToolbarSelectProps) {
  return (
    <select
      className={`editor-toolbar-select ${className}`}
      aria-label={label}
      title={label}
      value={value}
      onChange={(event) => {
        const selected = event.target.value

        if (selected === RESET_VALUE) {
          onReset?.()
        } else if (selected !== '') {
          onChange(selected)
        }
      }}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          style={previewFonts && option.value ? { fontFamily: option.value } : undefined}
        >
          {option.label}
        </option>
      ))}

      {resetLabel && onReset && <option value={RESET_VALUE}>↺ {resetLabel}</option>}
    </select>
  )
}

function Divider() {
  return <span className="editor-toolbar-divider" role="separator" />
}

function getBlockStyle(editor: Editor): BlockStyle {
  if (editor.isActive('heading', { level: 1 })) return 'h1'
  if (editor.isActive('heading', { level: 2 })) return 'h2'
  if (editor.isActive('heading', { level: 3 })) return 'h3'

  return 'paragraph'
}

function getTextAlign(editor: Editor): TextAlignValue {
  const alignments = ['center', 'right', 'justify'] as const

  return alignments.find((alignment) => editor.isActive({ textAlign: alignment })) ?? 'left'
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      const textStyle = getEffectiveTextStyle(ctx.editor)

      return {
        canUndo: ctx.editor.can().undo(),
        canRedo: ctx.editor.can().redo(),
        bold: ctx.editor.isActive('bold'),
        italic: ctx.editor.isActive('italic'),
        underline: ctx.editor.isActive('underline'),
        strike: ctx.editor.isActive('strike'),
        highlight: ctx.editor.isActive('highlight'),
        blockStyle: getBlockStyle(ctx.editor),
        textAlign: getTextAlign(ctx.editor),
        bulletList: ctx.editor.isActive('bulletList'),
        orderedList: ctx.editor.isActive('orderedList'),
        blockquote: ctx.editor.isActive('blockquote'),
        fontFamily: textStyle.fontFamily,
        fontSize: textStyle.fontSize,
        color: textStyle.color
      }
    }
  })

  // --- Fonte: mostra a que está valendo, mesmo que não esteja na lista ---
  const currentFamily = firstFontFamily(state.fontFamily)
  const knownFont = findFontOption(state.fontFamily)
  const fontValue = knownFont?.value ?? currentFamily
  const fontOptions: SelectOption[] = knownFont
    ? editorFontFamilies
    : [
        { label: currentFamily ? fontDisplayName(currentFamily) : '—', value: currentFamily },
        ...editorFontFamilies
      ]

  // --- Tamanho: idem ---
  const knownSize = editorFontSizes.some((size) => size.value === state.fontSize)
  const sizeLabel = state.fontSize.endsWith('px')
    ? String(parseFloat(state.fontSize))
    : state.fontSize || '—'
  const sizeOptions: SelectOption[] = knownSize
    ? editorFontSizes
    : state.fontSize
      ? [...editorFontSizes, { label: sizeLabel, value: state.fontSize }].sort(
          (a, b) => parseFloat(a.value) - parseFloat(b.value)
        )
      : [{ label: '—', value: '' }, ...editorFontSizes]

  function changeBlockStyle(value: string) {
    const chain = editor.chain().focus()

    if (value === 'paragraph') {
      chain.setParagraph().run()
    } else {
      chain.setHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run()
    }
  }

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatação do texto">
      <ToolbarButton
        label="Desfazer"
        shortcut="Ctrl+Z"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Refazer"
        shortcut="Ctrl+Shift+Z"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 {...iconProps} />
      </ToolbarButton>

      <Divider />

      <ToolbarSelect
        label="Estilo do parágrafo"
        className="editor-toolbar-select--style"
        value={state.blockStyle}
        options={blockStyleOptions}
        onChange={changeBlockStyle}
      />

      <ToolbarSelect
        label="Fonte"
        className="editor-toolbar-select--font"
        value={fontValue}
        options={fontOptions}
        resetLabel="Restaurar fonte padrão"
        previewFonts
        onChange={(value) => editor.chain().focus().setFontFamily(value).run()}
        onReset={() => editor.chain().focus().unsetFontFamily().run()}
      />

      <ToolbarSelect
        label="Tamanho da fonte"
        className="editor-toolbar-select--size"
        value={state.fontSize}
        options={sizeOptions}
        resetLabel="Restaurar tamanho padrão"
        onChange={(value) => editor.chain().focus().setFontSize(value).run()}
        onReset={() => editor.chain().focus().unsetFontSize().run()}
      />

      <Divider />

      <ToolbarButton
        label="Negrito"
        shortcut="Ctrl+B"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Itálico"
        shortcut="Ctrl+I"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Sublinhado"
        shortcut="Ctrl+U"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Tachado"
        shortcut="Ctrl+Shift+S"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Destacar trecho"
        shortcut="Ctrl+Shift+H"
        active={state.highlight}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter {...iconProps} />
      </ToolbarButton>

      <ColorPicker editor={editor} value={state.color} />

      <Divider />

      <AlignMenu editor={editor} value={state.textAlign} />

      <Divider />

      <ToolbarButton
        label="Lista com marcadores"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Lista numerada"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Citação"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Quebra de cena"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus {...iconProps} />
      </ToolbarButton>
    </div>
  )
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null
  }

  return <Toolbar editor={editor} />
}

export default EditorToolbar
