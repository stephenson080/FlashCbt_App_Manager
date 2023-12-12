import { app, Menu, BrowserWindow, ipcMain, nativeTheme } from "electron";
import { join } from "path";
import { readFileSync, readFile, readdir} from "fs";
import { exec, spawn, execFile,  } from "child_process";

let win: BrowserWindow;

let isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
}

function getDockerCommand(pass: string){
  const commandWithPass = `echo ${pass} | sudo -S`
  return `# Check if Docker is installed 
  if [ -x "$(command -v docker)" ]; then
      echo "Update docker"
      # command
  else
      echo "Install docker"
       # Install Docker
      echo "Installing Docker..."
      ${commandWithPass} apt update
      ${commandWithPass} apt install apt-transport-https ca-certificates curl software-properties-common
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
      ${commandWithPass} add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
      apt-cache policy docker-ce
      ${commandWithPass} apt install -y docker.io
      ${commandWithPass} apt install docker-ce
  fi
  
  # Check if Docker Compose is installed
  if [ -x "$(command -v docker compose)" ];
  then
      echo "Docker Compose is already installed."
  else
      # Install Docker Compose
      echo "Installing Docker Compose..."
      ${commandWithPass} apt update
      ${commandWithPass} apt install -y docker-compose
  
      # Check if the installation was successful
      if command -v docker-compose &> /dev/null
      then
          echo "Docker Compose has been successfully installed."
      else
          echo "Error: Failed to install Docker Compose."
          exit 1
      fi
  fi`
}

function getFlashCbtCommand(pass : string){
  const commandWithPass = `echo ${pass} | sudo -S`

  return `#download docker-compose file
  #download url to the docker-compose file
  compose_url="http://192.169.152.77/home/DownloadComposeFile"
  filename=docker-compose.yml
  # Destination path to save the Docker Compose file
  compose_file_path="./Desktop"
  #delete file if already exist in the current path
  
  if [ -f "$filename" ] ; then
      rm "$filename"
      echo "Deleted existing Docker-File in current path"
  fi
  #delete file if already exist in the Destination path
  destinationfile=$compose_file/$filename
  
  if [ -f "$destinationfile" ] ; then
      rm "$destinationfile"
      echo "Deleted existing Docker-File in destination path"
  fi
  echo "Downloading docker-compose file"
  curl $compose_url -o $filename
  # Check if the download was successful
  if [ $? -eq 0 ]; then
      echo "Docker Compose file downloaded successfully."
    # copy the file to specific directory
    echo "Copying downloaded file"
    cp  $filename $compose_file_path
    echo "Copy was successful"
      # Change to the directory where the Docker Compose file is located
      cd $(dirname $compose_file_path)
  #add currentuser to group
      ${commandWithPass} usermod -aG docker $USER
      #restart docker
      echo chemistry | sudo -S systemctl restart docker
      # Run Docker Compose
      # starting docker daemon
      #syetemctl start docker
      ${commandWithPass} docker compose up -d
  else
      echo "Failed to download Docker Compose file."
  fi
  
  #run the docker-compose file
  #enable the service to cbt service to run on startup of the computer`

}




// const appResRoot = join(process.resourcesPath, 'app.asar')

// console.log(appResRoot, 'root')

// console.log(app.getAppPath(), 'shsahas')

// const asarPath = join(app.getAppPath(), "..", '..', 'dist', 'linux-unpacked', 'resources', 'app.asar');

// console.log(asarPath, 'asar')

// // Read a file from inside the .asar archive
// const filePathInsideAsar = 'js/src/scripts/doc.sh';
// const fullPath = join(asarPath, filePathInsideAsar);

// readdir(asarPath, (err, data) => {
//   if (err) {
//     console.error('Error reading file:', err.message);
//     return;
//   }
//   console.log('File content:', data);
//   readdir(join(asarPath, data[0]), (err1, data_2) => {
//     if (err1) {
//       console.error('Error reading file:', err1.message);
//       return;
//     }
//     console.log('File content: 2', data_2);
//     readdir(join(asarPath, data[0], data_2[0]), (err2, data_3) => {
//       if (err2) {
//         console.error('Error reading file:', err2.message);
//         return;
//       }
//       console.log('File content: 3', data_3);
//       readdir(join(asarPath, data[0], data_2[0], data_3[1]), (err3, data_4) => {
//         if (err3) {
//           console.error('Error reading file:', err3.message);
//           return;
//         }
//         console.log('File content: 3', data_4);
//         readFile(`${join(asarPath, data[0], data_2[0], data_3[1], data_4[0])}`, (err4, data_5) => {
//           if (err4) {
//             console.error('Error reading file:', err4.message);
//             return;
//           }
//           exec(flashcbt, (error, stdout, stderr) => {
//             if (error) {
//               console.log(error.message, 'mgs')
//               return;
//             }
//             console.log(stdout, 'data');
//           });
//         })
       
//       })
//     })
//   })

  
// });

// exec(`bash ${fullPath}`, (error, stdout, stderr) => {
//   if (error) {
//     console.log(error.message, 'mgs')
//     return;
//   }
//   console.log(stdout, 'data');
// });

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

ipcMain.on("install-docker", function (e, pass) {
  console.log("install docker");
  installDocker(pass);
});

ipcMain.on("install-flashcbt", function (e, pass) {
  console.log("install FlashCbt");
  installFlashCbt(pass);
});



function checkDockerInstallation() {
 
  exec(`docker -v`, (error, stdout, stderr) => {
    if (error) {
      win.webContents.send("docker-v", [false, "Not Install"]);
      return;
    }

    const dockerVersion = stdout.trim();
    win.webContents.send("docker-v", [true, `v${dockerVersion}`]);
    console.log(`Docker version: ${dockerVersion}`);
  });
}

function installDocker(pass: string) {

  const command = getDockerCommand(pass)



    exec(command, (error, stdout, stderr) => {
      if (error) {
        win.webContents.send("error", error.message);
        return;
      }
      console.log(stdout);

      win.webContents.send('info', stdout)
    });



  
}

function installFlashCbt(pass: string) {
  const command = getFlashCbtCommand(pass)
  
      exec(command, (error, stdout, stderr) => {
        if (error) {
          win.webContents.send("error", error.message);
          return;
        }
        win.webContents.send('info', stdout)

      });

    
  
}

// Call the function to check Docker installation
