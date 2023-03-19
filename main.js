// Modules to control application life and create native browser window
const { menubar } = require('menubar');
const {app, BrowserWindow, globalShortcut, ipcMain, Menu} = require('electron')
const path = require('path');


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  ipcMain.handle('ping', () => 'pong')

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => mainWindow.webContents.send('update-counter', 1),
          label: 'Increment',
        },
        {
          click: () => mainWindow.webContents.send('update-counter', -1),
          label: 'Decrement',
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  ipcMain.on('counter-value', (_event, value) => {
    console.log(value)
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};


function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: 25 * 60,
    minutes: 25,
    seconds: 0,
  };

  updateClock();
}

function updateClock(mb) {
  const { remainingTime } = timer;
  const minutes = `${remainingTime.minutes}`.padStart(2, '0');
  const seconds = `${remainingTime.seconds}`.padStart(2, '0');

  // const min = document.getElementById('js-minutes');
  // const sec = document.getElementById('js-seconds');
  // min.textContent = minutes;
  // sec.textContent = seconds;

  // console.log(minutes, seconds);
  const title = " " + minutes + ":" + seconds;
  mb && mb.tray.setTitle(title, {fontType: 'monospacedDigit'})
}

function startTimer(mb) {
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;

  interval = setInterval(function() {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock(mb);

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);
    }
  }, 1000);
}

function getRemainingTime(endTime) {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds,
  }; 
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  const mb = menubar();

  globalShortcut.register('Command+Shift+I', () => {
    const isVisible = mb._isVisible;

    if (isVisible) {
      mb.hideWindow();
    } else {
      mb.showWindow();
    }
  })

  mb.on('ready', () => {
    mb.tray.setImage('images/clock.png');
    mb.tray.setTitle(' 25:00');
    console.log('app is ready');
    switchMode('pomodoro');
    startTimer(mb);
  })
  

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
