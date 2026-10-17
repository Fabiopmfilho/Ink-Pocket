import type { CharacterRecord, LocationRecord } from '../../database/models'
import type { Chapter } from '../../types/book'

import ChapterList from './ChapterList'
import CharacterList from './CharacterList'
import LocationList from './LocationList'
import SidebarSection from './SidebarSection'
import BookSwitcher from '../library/BookSwitcher'

type SidebarProps = {
  bookTitle: string
  chapters: Chapter[]
  characters: CharacterRecord[]
  locations: LocationRecord[]

  activeChapterId: string | null
  activeCharacterId: string | null
  activeLocationId: string | null

  homeActive: boolean

  onSelectHome: () => void
  onSelectChapter: (id: string) => void
  onSelectCharacter: (id: string) => void
  onSelectLocation: (id: string) => void

  onCreateChapter: () => void
  onCreateScene: (chapterId: string) => void
  onCreateCharacter: () => void
  onCreateLocation: () => void

  onDeleteDocument: (id: string) => void
  onDeleteCharacter: (id: string) => void
  onDeleteLocation: (id: string) => void

  onReorderDocuments: (documentIds: string[]) => void
  onMoveScene: (sceneId: string, targetChapterId: string) => void
}

function Sidebar({
  chapters,
  characters,
  locations,
  activeChapterId,
  activeCharacterId,
  activeLocationId,
  onSelectChapter,
  onSelectCharacter,
  onSelectLocation,
  onCreateChapter,
  onCreateScene,
  onCreateCharacter,
  onCreateLocation,
  onDeleteDocument,
  onDeleteCharacter,
  onDeleteLocation,
  onReorderDocuments,
  onMoveScene
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Book Writer</h1>
      </div>

      <BookSwitcher />

      <SidebarSection title="Capítulos" createTitle="Criar capítulo" onCreate={onCreateChapter}>
        <ChapterList
          chapters={chapters}
          activeChapterId={activeChapterId ?? ''}
          onSelectChapter={onSelectChapter}
          onCreateScene={onCreateScene}
          onDeleteDocument={onDeleteDocument}
          onReorderDocuments={onReorderDocuments}
          onMoveScene={onMoveScene}
        />
      </SidebarSection>

      <SidebarSection
        title="Personagens"
        createTitle="Criar personagem"
        onCreate={onCreateCharacter}
      >
        <CharacterList
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSelectCharacter={onSelectCharacter}
          onDeleteCharacter={onDeleteCharacter}
        />
      </SidebarSection>

      <SidebarSection title="Lugares" createTitle="Criar lugar" onCreate={onCreateLocation}>
        <LocationList
          locations={locations}
          activeLocationId={activeLocationId}
          onSelectLocation={onSelectLocation}
          onDeleteLocation={onDeleteLocation}
        />
      </SidebarSection>
    </aside>
  )
}

export default Sidebar
