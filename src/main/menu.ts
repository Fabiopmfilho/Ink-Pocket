import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  type MenuItemConstructorOptions
} from 'electron'

import { openAutoBackupFolder } from './backup'

export type MenuAction = 'new-book' | 'import-backup' | 'export-backup' | 'delete-book'

function sendToRenderer(action: MenuAction): void {
  const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]

  window?.webContents.send('menu:action', action)
}

function buildTemplate(): MenuItemConstructorOptions[] {
  const isMac = process.platform === 'darwin'

  const macAppMenu: MenuItemConstructorOptions[] = isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about', label: 'Sobre' },
            { type: 'separator' },
            { role: 'hide', label: 'Ocultar' },
            { role: 'hideOthers', label: 'Ocultar outros' },
            { role: 'unhide', label: 'Mostrar tudo' },
            { type: 'separator' },
            { role: 'quit', label: 'Sair' }
          ]
        }
      ]
    : []

  const developerItems: MenuItemConstructorOptions[] = app.isPackaged
    ? []
    : [
        { role: 'reload', label: 'Recarregar' },
        { role: 'toggleDevTools', label: 'Ferramentas do desenvolvedor' },
        { type: 'separator' }
      ]

  return [
    ...macAppMenu,
    {
      label: 'Arquivo',
      submenu: [
        { label: 'Novo livro', click: () => sendToRenderer('new-book') },
        { type: 'separator' },
        { label: 'Importar backup…', click: () => sendToRenderer('import-backup') },
        { label: 'Exportar backup…', click: () => sendToRenderer('export-backup') },
        {
          label: 'Abrir pasta dos backups automáticos',
          click: () => {
            openAutoBackupFolder().catch((error: unknown) => {
              dialog.showErrorBox(
                'Não foi possível abrir a pasta',
                error instanceof Error ? error.message : String(error)
              )
            })
          }
        },
        { type: 'separator' },
        { label: 'Excluir livro atual…', click: () => sendToRenderer('delete-book') },
        { type: 'separator' },
        isMac ? { role: 'close', label: 'Fechar janela' } : { role: 'quit', label: 'Sair' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar tudo' }
      ]
    },
    {
      label: 'Exibir',
      submenu: [
        ...developerItems,
        { role: 'resetZoom', label: 'Tamanho padrão' },
        { role: 'zoomIn', label: 'Aumentar zoom' },
        { role: 'zoomOut', label: 'Diminuir zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela cheia' }
      ]
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        ...(isMac ? [{ role: 'zoom' as const, label: 'Ampliar' }] : [])
      ]
    }
  ]
}

export function setupAppMenu(): void {
  const template = buildTemplate()

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  ipcMain.handle('menu:labels', () => template.map((entry) => entry.label ?? ''))

  ipcMain.handle('menu:popup', (event, index: unknown, x: unknown, y: unknown) => {
    if (typeof index !== 'number' || typeof x !== 'number' || typeof y !== 'number') {
      return
    }

    const submenu = template[index]?.submenu
    const window = BrowserWindow.fromWebContents(event.sender)

    if (!Array.isArray(submenu) || !window) {
      return
    }

    Menu.buildFromTemplate(submenu).popup({ window, x: Math.round(x), y: Math.round(y) })
  })
}
