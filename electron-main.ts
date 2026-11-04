const { join } = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const electron = require('electron');

// Type imports for TypeScript type checking
import type { BrowserWindow as BrowserWindowType, SaveDialogOptions, IpcMainEvent } from 'electron/main';
import type { ChildProcess } from 'child_process';

const { app, BrowserWindow, ipcMain, dialog, shell } = electron;

let mainWindow: BrowserWindowType | null = null;
let serverProcess: ChildProcess | null = null;
let serverReady = false;

const isDev = !app.isPackaged;
const PORT = 3000;
const SERVER_URL = `http://localhost:${PORT}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'هدف تو - Hadafe To',
    icon: join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    show: false,
    backgroundColor: '#0f172a',
  });

  // Show window when ready to prevent visual flash
  mainWindow!.once('ready-to-show', () => {
    mainWindow!.show();
    if (isDev) {
      mainWindow!.webContents.openDevTools();
    }
  });

  // Handle external links
  mainWindow!.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load the app
  loadApp();

  mainWindow!.on('closed', () => {
    mainWindow = null;
  });
}

async function loadApp() {
  if (!mainWindow) return;

  if (isDev) {
    // In development, wait for Vite dev server
    await waitForServer();
    mainWindow.loadURL(SERVER_URL);
  } else {
    // In production, start Express server and load built files
    await startExpressServer();
    mainWindow.loadURL(SERVER_URL);
  }
}

async function startExpressServer() {
  return new Promise<void>((resolve, reject) => {
    const serverPath = join(process.resourcesPath, 'dist-server', 'server.js');

    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Server file not found at ${serverPath}`));
      return;
    }

    serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, NODE_ENV: 'production', PORT: PORT.toString() },
      cwd: join(process.resourcesPath),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    serverProcess!.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log('[Express]', output);
      if (output.includes('Server running on') || output.includes('http://0.0.0.0:')) {
        serverReady = true;
        // Give server a moment to fully initialize
        setTimeout(() => resolve(), 1000);
      }
    });

    serverProcess!.stderr?.on('data', (data: Buffer) => {
      console.error('[Express Error]', data.toString());
    });

    serverProcess!.on('error', (err: Error) => {
      console.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess!.on('exit', (code: number) => {
      console.log(`Server exited with code ${code}`);
      serverReady = false;
    });

    // Timeout fallback
    setTimeout(() => {
      if (!serverReady) {
        resolve(); // Try loading anyway
      }
    }, 10000);
  });
}

function waitForServer(maxAttempts = 30) {
  return new Promise<void>((resolve, reject) => {
    let attempts = 0;
    const checkServer = () => {
      fetch(SERVER_URL)
        .then(() => {
          serverReady = true;
          resolve();
        })
        .catch(() => {
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('Server did not start in time'));
          } else {
            setTimeout(checkServer, 1000);
          }
        });
    };
    checkServer();
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

// IPC handlers for native dialogs
ipcMain.handle('dialog:openDirectory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('dialog:saveFile', async (_event: unknown, options: SaveDialogOptions) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result.filePath || null;
});

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:quit', () => {
  app.quit();
});

ipcMain.handle('shell:openExternal', async (_event: unknown, url: string) => {
  await shell.openExternal(url);
});

// Auto-updater can be added here later