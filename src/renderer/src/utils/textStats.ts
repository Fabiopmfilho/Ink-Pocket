const BLOCK_ELEMENTS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DIV',
  'DL',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TR',
  'UL'
])

export function getPlainText(content: string): string {
  if (!content) return ''

  const document = new DOMParser().parseFromString(content, 'text/html')

  function readNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const element = node as HTMLElement

    if (element.tagName === 'BR') {
      return '\n'
    }

    const text = Array.from(element.childNodes, readNode).join('')

    return BLOCK_ELEMENTS.has(element.tagName) ? `\n${text}\n` : text
  }

  return Array.from(document.body.childNodes, readNode)
    .join('')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function getWordCount(content: string): number {
  const text = getPlainText(content)
  const words = text.match(/[\p{L}\p{N}]+(?:[’'][\p{L}]+)*(?:-[\p{L}\p{N}]+)*/gu)

  return words?.length ?? 0
}

export function getCharacterCount(content: string): number {
  return getPlainText(content).length
}
