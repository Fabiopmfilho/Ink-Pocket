import { useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Check, ChevronDown, Plus } from 'lucide-react'

import { BookLibraryContext, type BookLibraryValue } from './BookLibraryContext'

type MenuPosition = {
  top: number
  left: number
  width: number
}

function BookSwitcherMenu({ books, activeBookId, onSelectBook, onCreateBook }: BookLibraryValue) {
  const [position, setPosition] = useState<MenuPosition | null>(null)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const open = position !== null
  const activeBook = books.find((book) => book.id === activeBookId)

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node

      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setPosition(null)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPosition(null)
        triggerRef.current?.focus()
      }
    }

    const handleResize = () => setPosition(null)

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [open])

  function toggleMenu() {
    if (open) {
      setPosition(null)
      return
    }

    const rect = triggerRef.current?.getBoundingClientRect()

    if (rect) {
      setPosition({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 240) })
    }
  }

  function chooseBook(bookId: string) {
    setPosition(null)

    if (bookId !== activeBookId) {
      onSelectBook(bookId)
    }
  }

  function createBook() {
    setPosition(null)
    onCreateBook()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="book-switcher-trigger"
        onClick={toggleMenu}
        title="Trocar de livro"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{activeBook?.title || 'Livro sem título'}</span>

        <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {position &&
        createPortal(
          <div
            ref={menuRef}
            className="book-switcher-menu"
            role="menu"
            aria-label="Livros"
            style={{ top: position.top, left: position.left, width: position.width }}
          >
            {books.map((book) => (
              <button
                key={book.id}
                type="button"
                role="menuitemradio"
                aria-checked={book.id === activeBookId}
                className="book-switcher-item"
                onClick={() => chooseBook(book.id)}
              >
                <span className="book-switcher-check">
                  {book.id === activeBookId && (
                    <Check size={14} strokeWidth={2} aria-hidden="true" />
                  )}
                </span>

                <span className="book-switcher-item-title">{book.title || 'Livro sem título'}</span>
              </button>
            ))}

            <div className="book-switcher-divider" role="separator" />

            <button
              type="button"
              role="menuitem"
              className="book-switcher-item book-switcher-create"
              onClick={createBook}
            >
              <span className="book-switcher-check">
                <Plus size={14} strokeWidth={2} aria-hidden="true" />
              </span>

              <span className="book-switcher-item-title">Novo livro</span>
            </button>
          </div>,
          document.body
        )}
    </>
  )
}

function BookSwitcher() {
  const library = useContext(BookLibraryContext)

  if (!library) {
    return null
  }

  return <BookSwitcherMenu {...library} />
}

export default BookSwitcher
