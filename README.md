# Ink Pocket

**Keep your ideas close.**

A desktop application for writing and organizing books, inspired by tools such as Scrivener. Everything lives on your computer: manuscript, characters, locations, notes, and the references that connect them.

> **Status:** in active development. Not yet a release-ready product.
> The interface is currently in Brazilian Portuguese.

![Ink Pocket](./src/renderer/src/assets/github/Captura%20de%20tela%202026-10-18%20230400.png)

## Highlights

- **Chapters and scenes** with drag and drop, in a clean writing environment.
- **Characters and locations** with detailed profiles, referenced straight from the text with `@` and `#`.
- **Multiple books**, switchable from the sidebar.
- **Local-first**: your data stays on your machine, with manual and automatic backups.
- **Quick search** across the whole book (`Ctrl+K`).

## Features

### Manuscript

- Create chapters and scenes, and organize scenes inside chapters.
- Expand and collapse chapters in the sidebar.
- Reorder chapters and scenes with drag and drop, and move scenes between chapters.
- Rename and delete chapters and scenes. Deleting a chapter also removes its scenes.
- Chapter overview with a scene board and a "read the whole chapter" view.
- Per-document notes and word/character counts in the inspector.
- Home view with all chapters and book progress.

### Rich text editor

Powered by [Tiptap](https://tiptap.dev).

- Toolbar with undo/redo, font family and size, bold, italic, underline, strikethrough, highlight, text color, headings, alignment, lists, quotes, and scene breaks.
- Typographic quotes and ellipsis.
- Dialogue dash: typing `- ` at the start of a line becomes `— `.
- Spell checking in Brazilian Portuguese.
- Word count in the footer and live save status.
- Focus mode for distraction-free writing.

### Characters and locations

- **Characters:** name, aliases, role, age, status, description, appearance, personality, motivation, conflict, backstory, and notes.
- **Locations:** name, type, region, status, description, atmosphere, history, culture, dangers, plot importance, and notes.
- Each profile lists where the character or location is mentioned in the manuscript.

### References

- `@` references characters and `#` references locations, with suggestions filtered as you type.
- References are stored by entity ID, not by displayed name.
- Clicking a reference opens the corresponding profile.
- Renaming a character or location updates its references throughout the project, with no search and replace.

### Books and navigation

- Switch between books, create new ones, or delete them from the sidebar and the **File** menu.
- The last opened book is remembered.
- Quick search finds chapters, scenes, characters, and locations.
- Collapsible sidebar and inspector.

### Backup and recovery

- **Export backup** (File › Export backup…): saves the active book as a `.json` file.
- **Import backup** (File › Import backup…): creates a **new** book from a backup file. It never overwrites existing books, generates new IDs, and keeps `@` and `#` references pointing to the right profiles.
- **Automatic backups**: one file per day for each book, keeping the 14 most recent. Empty books are skipped, so a fresh database never replaces a good backup. Open the folder from File › Open automatic backups folder.

> The database lives in the app's local storage. Exporting a backup now and then, and keeping it somewhere else (cloud or external drive), is the safest way to protect your work.

### Reliability

- Auto-save with a short debounce to avoid excessive writes.
- Pending text is saved when you switch documents or close the window.
- Failed saves are retried automatically, and the editor shows the error state until they succeed.

## Keyboard shortcuts

On macOS, use `⌘` instead of `Ctrl`.

| Action                                | Shortcut                         |
| ------------------------------------- | -------------------------------- |
| Quick search                          | `Ctrl+K`                         |
| New chapter                           | `Ctrl+Shift+N`                   |
| Toggle focus mode                     | `Ctrl+Shift+F` (exit with `Esc`) |
| Toggle sidebar                        | `Ctrl+\`                         |
| Toggle inspector                      | `Ctrl+Alt+I`                     |
| Bold / Italic / Underline             | `Ctrl+B` / `Ctrl+I` / `Ctrl+U`   |
| Strikethrough                         | `Ctrl+Shift+S`                   |
| Highlight                             | `Ctrl+Shift+H`                   |
| Align left / center / right / justify | `Ctrl+Shift+L` / `E` / `R` / `J` |
| Undo / Redo                           | `Ctrl+Z` / `Ctrl+Shift+Z`        |
| Mention a character / a location      | `@` / `#`                        |

## Tech stack

- **Electron**: desktop runtime
- **React**: user interface
- **TypeScript**: application language
- **Vite / electron-vite**: development and build tooling
- **Tiptap**: rich text editor
- **Dexie**: IndexedDB database layer
- **@dnd-kit**: drag and drop
- **Lucide**: icons
- **ESLint** and **Prettier**: code quality and formatting

## Architecture

Application data is stored locally in **IndexedDB**, accessed through **Dexie**. Database versions and migrations live in the database layer. Operations that need the operating system (file dialogs, the native menu, automatic backups) run in the Electron main process and are exposed to the renderer through the preload script.

```text
src/
├── main/                 # Electron main process
│   ├── index.ts          # window creation, app lifecycle
│   ├── menu.ts           # native menu (File, Edit, View, Window)
│   └── backup.ts         # save/open dialogs and automatic backups
├── preload/              # secure bridge between main and renderer
│   ├── index.ts
│   └── index.d.ts
└── renderer/
    └── src/
        ├── components/
        │   ├── editor/       # rich text editor, toolbar, entity editors
        │   ├── home/         # overview and book settings
        │   ├── inspector/    # notes and statistics
        │   ├── library/      # book switcher
        │   ├── manuscript/   # chapter overview and scene board
        │   ├── notice/       # temporary feedback messages
        │   ├── search/       # quick search and page header
        │   ├── sidebar/      # navigation tree
        │   └── titlebar/     # custom title bar (Windows and Linux)
        ├── database/         # Dexie schema, models, migrations, seed
        ├── hooks/            # data, shortcuts, auto-save, backups
        ├── services/         # database operations and backup logic
        ├── types/
        └── utils/
```

The folder layout above is simplified and may drift as the project grows.

## Getting started

### Requirements

- Node.js (a recent LTS release)
- pnpm
- Windows, macOS, or Linux

### Install and run

```bash
git clone https://github.com/Fabiopmfilho/book-writer.git
cd book-writer
pnpm install
pnpm dev
```

### Scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Starts the app in development mode            |
| `pnpm typecheck`   | Type checks the main process and the renderer |
| `pnpm lint`        | Runs ESLint                                   |
| `pnpm format`      | Formats the code with Prettier                |
| `pnpm build`       | Type checks and builds the app                |
| `pnpm build:win`   | Builds the Windows installer                  |
| `pnpm build:mac`   | Builds the macOS package                      |
| `pnpm build:linux` | Builds the Linux packages                     |

## Development notes

- **Keep all `@tiptap/*` packages on the same version.** Mixing versions (for example, one extension newer than `@tiptap/core`) breaks the build with missing exports. Pin them with the same exact version.
- **Changes in `src/main` and `src/preload` need a restart of `pnpm dev`.** Only the renderer hot-reloads.
- **Never edit past database versions.** Add a new Dexie version with its own migration instead.
- Run `pnpm typecheck` and `pnpm lint` before committing.

## Roadmap

### Done

- [x] Chapters and scenes with drag and drop
- [x] Rich text editor with formatting toolbar
- [x] Characters, locations, and `@` / `#` references
- [x] Quick search
- [x] Focus mode
- [x] Multiple books with a book switcher
- [x] Manual backup (export and import) and automatic daily backups
- [x] Native menu with a custom title bar on Windows and Linux

### Next

- [ ] Open a search result scrolled to the matching passage
- [ ] Export to DOCX, PDF, and EPUB, with the manuscript compiled in order
- [ ] Page-style editing layout
- [ ] Typewriter scrolling in focus mode
- [ ] Writing goals and daily word count
- [ ] Version history per scene
- [ ] Save handshake with the main process when closing the window

## Project goals

The long-term goal is a focused desktop writing environment where an author can manage an entire book in one place: manuscript structure, chapters and scenes, characters, locations, references, notes and metadata, and the writing itself.

The application is being developed incrementally, prioritizing a reliable writing workflow before adding more advanced features.

## License

No license has been defined yet. Until one is added, the code is not licensed for reuse.
