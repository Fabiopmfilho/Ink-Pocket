import type { Editor } from '@tiptap/react'

export type EffectiveTextStyle = {
  fontFamily: string
  fontSize: string
  color: string
}

export function toHex(value: string): string {
  const text = value.trim().toLowerCase()

  if (/^#[0-9a-f]{6}$/.test(text)) {
    return text
  }

  if (/^#[0-9a-f]{3}$/.test(text)) {
    return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`
  }

  const match = text.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/)

  if (match) {
    return `#${[match[1], match[2], match[3]]
      .map((part) => Number(part).toString(16).padStart(2, '0'))
      .join('')}`
  }

  return ''
}

function getElementAtSelection(editor: Editor): Element | null {
  try {
    const { node } = editor.view.domAtPos(editor.state.selection.from)

    return node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
  } catch {
    return null
  }
}

export function getEffectiveTextStyle(editor: Editor): EffectiveTextStyle {
  const attributes = editor.getAttributes('textStyle')
  const element = getElementAtSelection(editor)
  const computed = element ? window.getComputedStyle(element) : null

  const ownFontFamily = (attributes.fontFamily as string | undefined) ?? ''
  const ownFontSize = (attributes.fontSize as string | undefined) ?? ''
  const ownColor = (attributes.color as string | undefined) ?? ''

  return {
    fontFamily: ownFontFamily || computed?.fontFamily || '',
    fontSize: ownFontSize || (computed ? `${Math.round(parseFloat(computed.fontSize))}px` : ''),
    color: toHex(ownColor) || toHex(computed?.color ?? '')
  }
}
