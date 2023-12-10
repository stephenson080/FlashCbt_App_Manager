import { app, Menu, BrowserWindow, ipcMain, nativeTheme } from "electron";
import { join } from "path";
import { exec } from "child_process";

let win: BrowserWindow;

let isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
}

async function createWindow() {
  const icon =
    process.platform === "linux"
      ? join(__dirname, "..", "..", "public", "'Official_JAMB_logo.png'")
      : join(__dirname, "..", "..", "public", "jamb-logo.ico");
  const page = join(__dirname, "..", "..", "public", "index.html");

  win = new BrowserWindow({
    height: 800,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon,
  });

  await win.loadFile(page);

  // Menu.setApplicationMenu(null)

  // startWindow.webContents.send('getIp', '')
}

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.releaseSingleInstanceLock();
    app.quit();
  }
});

app.on("second-instance", (e, agr, cwd) => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  } else {
    return;
  }
});

ipcMain.on("check-app-versions", function (e) {
  console.log("hello");
  checkDockerInstallation();
});

ipcMain.on("install-docker", function (e) {
  console.log("install docker");
  installDocker()
});

ipcMain.on("install-flashcbt", function (e) {
  console.log("install FlashCbt");
  installFlashCbt()
});

function checkDockerInstallation() {
  exec("docker -v", (error, stdout, stderr) => {
    if (error) {
      win.webContents.send("docker-v", [false, "Not Install"]);
      return;
    }

    const dockerVersion = stdout.trim();
    win.webContents.send("docker-v", [true, `v${dockerVersion}`]);
    // console.log(`Docker version: ${dockerVersion}`);
  });
}

function installDocker() {
  // if (process.platform !== "linux") {
  //   win.webContents.send(
  //     "error",
  //     `Can't install docker. Check docker website to know how to install on your machine`
  //   );
  //   return
  // }
  const scriptPath =  join(__dirname, 'scripts', 'docker.sh')
  exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      win.webContents.send('error', error.message);
      return;
    }
    console.log(stdout)
  });
}

function installFlashCbt() {
  // if (process.platform !== "linux") {
  //   win.webContents.send(
  //     "error",
  //     `Can't install docker. Check docker website to know how to install on your machine`
  //   );
  //   return
  // }
  const scriptPath =  join(__dirname, 'scripts', 'flashcbt.sh')
  exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      win.webContents.send('error', error.message);
      return;
    }
    console.log(stdout)
  });
}



// Call the function to check Docker installation
