import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveBackup(content: string, suggestedName: string): Promise<{ saved: boolean; path?: string }>
      openBackup(): Promise<{ path: string; content: string } | null>
      saveAutoBackup(content: string, bookId: string): Promise<{ path: string }>
      onMenuAction(callback: (action: string) => void): () => void
    }
  }
}
