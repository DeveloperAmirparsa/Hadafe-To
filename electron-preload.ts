import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Dialogs
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveFile: (options: Electron.SaveDialogOptions) => ipcRenderer.invoke('dialog:saveFile', options),

  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  quit: () => ipcRenderer.invoke('app:quit'),

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),

  // Platform info
  platform: process.platform,
  isElectron: true,
});

// Type declarations for the exposed API
declare global {
  interface Window {
    electronAPI: {
      openDirectory: () => Promise<string | null>;
      saveFile: (options: Electron.SaveDialogOptions) => Promise<string | null>;
      getVersion: () => Promise<string>;
      quit: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      platform: string;
      isElectron: boolean;
    };
  }
}