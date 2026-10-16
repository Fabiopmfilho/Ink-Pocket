import { Extension, InputRule } from '@tiptap/core'

export const DialogueDash = Extension.create({
  name: 'dialogueDash',
  priority: 1000,

  addInputRules() {
    return [
      new InputRule({
        find: /^[-–]\s$/,
        handler: ({ state, range }) => {
          state.tr.insertText('— ', range.from, range.to)
        }
      })
    ]
  }
})
