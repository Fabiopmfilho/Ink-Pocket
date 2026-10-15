import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  saveBackup: (
    content: string,
    suggestedName: string
  ): Promise<{ saved: boolean; path?: string }> =>
    ipcRenderer.invoke('backup:save', content, suggestedName),

  openBackup: (): Promise<{ path: string; content: string } | null> =>
    ipcRenderer.invoke('backup:open'),

  saveAutoBackup: (content: string): Promise<{ path: string }> =>
    ipcRenderer.invoke('backup:auto', content),

  openBackupsFolder: (): Promise<void> => ipcRenderer.invoke('backup:open-folder')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
