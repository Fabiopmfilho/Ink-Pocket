import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style'
import { CharacterCount, Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/react'

import type { CharacterRecord, LocationRecord } from '../../database/models'
import { useDebouncedSave } from '../../hooks/useDebouncedSave'
import { DialogueDash } from './DialogueDash'
import EditorToolbar from './EditorToolbar'
import { createReferenceMention } from './referenceMention'

export type EditorSaveStatus = 'editing' | 'saving' | 'saved' | 'error'

type RichTextEditorProps = {
  content: string
  characters: CharacterRecord[]
  locations: LocationRecord[]
  className?: string
  placeholder?: string
  showToolbar?: boolean
  onSave: (content: string) => void | Promise<void>
  onOpenReference: (entityId: string) => void
  onSaveStatusChange?: (status: EditorSaveStatus) => void
  onWordCountChange?: (words: number) => void
  toolbarContainer?: HTMLElement | null
}

function RichTextEditor({
  content,
  characters,
  locations,
  className = '',
  placeholder = 'Comece a escrever...',
  showToolbar = true,
  onSave,
  onOpenReference,
  onSaveStatusChange,
  onWordCountChange,
  toolbarContainer
}: RichTextEditorProps) {
  const charactersRef = useRef(characters)
  const locationsRef = useRef(locations)
  const openReferenceRef = useRef(onOpenReference)
  const wordCountChangeRef = useRef(onWordCountChange)

  useEffect(() => {
    charactersRef.current = characters
  }, [characters])

  useEffect(() => {
    locationsRef.current = locations
  }, [locations])

  useEffect(() => {
    openReferenceRef.current = onOpenReference
  }, [onOpenReference])

  useEffect(() => {
    wordCountChangeRef.current = onWordCountChange
  }, [onWordCountChange])

  const { status, scheduleSave } = useDebouncedSave(onSave, 500)

  useEffect(() => {
    onSaveStatusChange?.(status)
  }, [status, onSaveStatusChange])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        link: false
      }),

      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'left' }),

      Placeholder.configure({ placeholder }),

      CharacterCount,

      Typography.configure({
        copyright: false,
        trademark: false,
        servicemark: false,
        registeredTrademark: false,
        plusMinus: false,
        notEqual: false,
        multiplication: false,
        laquo: false,
        raquo: false,
        leftArrow: false,
        rightArrow: false,
        superscriptTwo: false,
        superscriptThree: false,
        oneHalf: false,
        oneQuarter: false,
        threeQuarters: false
      }),

      DialogueDash,

      Highlight,

      // eslint-disable-next-line react-hooks/refs
      createReferenceMention({
        getCharacters: () => charactersRef.current,
        getLocations: () => locationsRef.current
      })
    ],

    content: content || '<p></p>',

    editorProps: {
      attributes: {
        class: `editor-document ${className}`.trim(),
        spellcheck: 'true',
        lang: 'pt-BR'
      },

      handleClickOn(_view, _position, node) {
        if (node.type.name !== 'mention') {
          return false
        }

        const entityId = node.attrs.id

        if (typeof entityId !== 'string') {
          return false
        }

        openReferenceRef.current(entityId)

        return true
      }
    },

    onCreate({ editor: currentEditor }) {
      wordCountChangeRef.current?.(currentEditor.storage.characterCount.words())
    },

    onUpdate({ editor: currentEditor }) {
      wordCountChangeRef.current?.(currentEditor.storage.characterCount.words())
      scheduleSave(currentEditor.getHTML())
    }
  })

  const toolbar = showToolbar ? <EditorToolbar editor={editor} /> : null

  return (
    <>
      {toolbarContainer === undefined
        ? toolbar
        : toolbarContainer && toolbar && createPortal(toolbar, toolbarContainer)}

      <div className="rich-text-editor">
        <EditorContent editor={editor} />
      </div>
    </>
  )
}

export default RichTextEditor
