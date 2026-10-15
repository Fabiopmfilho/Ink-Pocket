import { useEffect } from 'react'

interface KeyboardShortcutOptions {
  focusMode: boolean
  onToggleFocusMode: () => void
  onExitFocusMode: () => void
  onCreateChapter: () => void
  onToggleSidebar: () => void
  onToggleInspector: () => void
  onOpenQuickSearch: () => void
}

export function useKeyboardShortcuts({
  focusMode,
  onToggleFocusMode,
  onExitFocusMode,
  onCreateChapter,
  onToggleSidebar,
  onToggleInspector,
  onOpenQuickSearch
}: KeyboardShortcutOptions): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const modifier = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (!modifier) {
        if (event.key === 'Escape' && focusMode) {
          onExitFocusMode()
        }
        return
      }

      if (event.repeat) return

      if (event.shiftKey && key === 'f') {
        event.preventDefault()
        onToggleFocusMode()
        return
      }

      if (event.shiftKey && key === 'n') {
        event.preventDefault()
        onCreateChapter()
        return
      }

      if (key === '\\' && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        onToggleSidebar()
        return
      }

      if (event.altKey && event.code === 'KeyI') {
        event.preventDefault()
        onToggleInspector()
      }

      if (key === 'k' && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        onOpenQuickSearch()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    focusMode,
    onToggleFocusMode,
    onExitFocusMode,
    onCreateChapter,
    onToggleSidebar,
    onToggleInspector,
    onOpenQuickSearch
  ])
}
