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

<<<<<<< HEAD
  const document = new DOMParser().parseFromString(content, 'text/html')
=======
  const parsedDocument = new DOMParser().parseFromString(content, 'text/html')
>>>>>>> f922f08353efd10d5095c69441724eabf1115e8f

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

<<<<<<< HEAD
  return Array.from(document.body.childNodes, readNode)
=======
  return Array.from(parsedDocument.body.childNodes, readNode)
>>>>>>> f922f08353efd10d5095c69441724eabf1115e8f
    .join('')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function getWordCount(content: string): number {
  const text = getPlainText(content)
<<<<<<< HEAD
=======

>>>>>>> f922f08353efd10d5095c69441724eabf1115e8f
  const words = text.match(/[\p{L}\p{N}]+(?:[’'][\p{L}]+)*(?:-[\p{L}\p{N}]+)*/gu)

  return words?.length ?? 0
}

export function getCharacterCount(content: string): number {
  return getPlainText(content).length
}
