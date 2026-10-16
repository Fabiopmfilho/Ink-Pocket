# Ink Poket

## Keep your ideas close.

Desktop application for writing and organizing books, inspired by tools such as Scrivener.

The project is being developed with a focus on a clean writing experience, manuscript organization, characters, locations, and contextual references between the text and the project's entities.

> **Status:** In active development. The project is not yet a final/release-ready product.

## Features

### Manuscript organization

- Create chapters and scenes.
- Organize scenes inside chapters.
- Expand and collapse chapters.
- Reorder chapters and scenes with drag and drop.
- Move scenes between chapters.
- Rename and delete chapters/scenes.
- Deleting a chapter also removes its scenes.
- Select and navigate between manuscript documents from the sidebar.

### Rich text editor

- Rich text editing powered by Tiptap.
- Automatic saving with a short debounce to avoid excessive database writes.
- Save status feedback in the editor.
- Document content is stored locally.

### Characters

- Create and edit characters.
- Character information includes:
  - Name
  - Aliases
  - Role
  - Age
  - Status
  - Description
  - Appearance
  - Personality
  - Motivation
  - Conflict
  - Backstory
  - Notes

### Locations

- Create and edit locations.
- Location information includes:
  - Name
  - Type
  - Region
  - Status
  - Description
  - Atmosphere
  - History
  - Culture
  - Dangers
  - Plot importance
  - Notes

### References

The editor supports contextual references to project entities:

- `@` for characters.
- `#` for locations.
- Suggestions are filtered while typing.
- References are stored using the entity ID rather than only the displayed name.
- Clicking a reference opens the corresponding character or location.
- Renaming a character or location automatically updates its references throughout the project.

This allows the author to rename an entity without having to manually search and replace every occurrence in the manuscript.

### Interface

- Collapsible sidebar sections.
- Toggle visibility of the left sidebar.
- Toggle visibility of the right inspector.
- Home/dashboard view.
- Book/project settings.
- Separate navigation for manuscript, characters, and locations.

## Tech Stack

- **Electron** — desktop application runtime
- **React** — user interface
- **TypeScript** — application language
- **Vite / electron-vite** — development and build tooling
- **Tiptap** — rich text editor
- **Dexie** — IndexedDB database layer
- **@dnd-kit** — drag and drop interactions
- **ESLint** — code quality
- **Prettier** — code formatting

## Architecture

The renderer is organized around a few main areas:

```text
src/
├── main/
│   └── ...
├── preload/
│   └── ...
└── renderer/
    └── src/
        ├── components/
        │   ├── editor/
        │   ├── home/
        │   ├── settings/
        │   ├── sidebar/
        │   └── ...
        ├── database/
        ├── hooks/
        ├── services/
        ├── types/
        └── ...
```

Application data is stored locally using **IndexedDB**, accessed through **Dexie**. Database versions and migrations are handled in the database layer.

## Requirements

- Node.js
- pnpm
- Windows, macOS, or Linux

## Getting Started

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Fabiopmfilho/book-writer.git
cd book-writer
pnpm install
```

Start the development environment:

```bash
pnpm dev
```

## Useful Commands

### Type checking

Check the Node/Electron side and the renderer:

```bash
pnpm typecheck
```

### Development

```bash
pnpm dev
```

### Lint

```bash
pnpm lint
```

### Format

```bash
pnpm format
```

### Production build

```bash
pnpm build
```

### Build for Windows

```bash
pnpm build:win
```

### Build for macOS

```bash
pnpm build:mac
```

### Build for Linux

```bash
pnpm build:linux
```

## Development Roadmap

The project is still evolving. The next development stages include:

- Improve manuscript and document management.
- Harden selection and state behavior after deleting or moving documents.
- Continue improving the rich text editor.
- Expand character and location management.
- Improve reference handling and navigation.
- Add focus/writing modes.
- Expand the home/dashboard experience.
- Improve project settings.
- Add import/export functionality.
- Add backup and recovery features.

## Project Goals

The long-term goal is to provide a focused desktop writing environment where an author can manage an entire book in one place:

- Manuscript structure
- Chapters and scenes
- Characters
- Locations
- References
- Notes and metadata
- Writing and editing

The application is intentionally being developed incrementally, prioritizing a reliable writing workflow before adding more advanced features.

## License

No license has been defined for the project yet.
