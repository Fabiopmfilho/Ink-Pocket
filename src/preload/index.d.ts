import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      platform: string
      saveBackup(content: string, suggestedName: string): Promise<{ saved: boolean; path?: string }>
      openBackup(): Promise<{ path: string; content: string } | null>
      saveAutoBackup(content: string, bookId: string): Promise<{ path: string }>
      onMenuAction(callback: (action: string) => void): () => void
      getMenuLabels(): Promise<string[]>
      popupMenu(index: number, x: number, y: number): Promise<void>
    }
  }
}
