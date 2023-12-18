import { app, Menu, BrowserWindow, ipcMain, nativeTheme } from "electron";
import { join } from "path";
import { exec } from "child_process";

let win: BrowserWindow;

let isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
}

function getLocalVersion(){
  return `#!/bin/bash

  # Set your Docker Hub repository and image name
  DOCKER_HUB_REPO="library/ubuntu"
  DOCKER_IMAGE_NAME="ubuntu"
  
  # Get the SHA (digest) of the latest image from Docker Hub
  LATEST_DIGEST=$(curl -s "https://hub.docker.com/v2/repositories/$DOCKER_HUB_REPO/tags/$DOCKER_IMAGE_NAME" | jq -r '.images[0].digest')
  
  # Get the SHA (digest) of the local image
  LOCAL_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' $DOCKER_IMAGE_NAME | cut -d '@' -f 2)
  
  # Compare the digests
  if [ "$LATEST_DIGEST" == "$LOCAL_DIGEST" ]; then
      echo "The local image is up-to-date."
  else
      echo "There is a newer version available on Docker Hub."
  fi`
}

function getDockerCommand(pass: string) {
  const commandWithPass = `echo ${pass} | sudo -S`;
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
      ${commandWithPass}  apt-get update
      ${commandWithPass}  apt-get install docker-compose-plugin
  
      # Check if the installation was successful
      if command -v docker-compose &> /dev/null
      then
          echo "Docker Compose has been successfully installed."
      else
          echo "Error: Failed to install Docker Compose."
          exit 1
      fi
  fi`;
}

// function getFlashCbtCommand(pass: string) {
//   const commandWithPass = `echo ${pass} | sudo -S`;

//   return `#download docker-compose file
//   #download url to the docker-compose file
//   compose_url="http://192.169.152.77/home/DownloadComposeFile"
//   filename=docker-compose.yml
//   # Destination path to save the Docker Compose file
//   compose_file_path="./Desktop"
//   #delete file if already exist in the current path
  
//   if [ -f "$filename" ] ; then
//       rm "$filename"
//       echo "Deleted existing Docker-File in current path"
//   fi
//   #delete file if already exist in the Destination path
//   destinationfile=$compose_file/$filename
  
//   if [ -f "$destinationfile" ] ; then
//       rm "$destinationfile"
//       echo "Deleted existing Docker-File in destination path"
//   fi
//   echo "Downloading docker-compose file"
//   curl $compose_url -o $filename
//   # Check if the download was successful
//   if [ $? -eq 0 ]; then
//       echo "Docker Compose file downloaded successfully."
//     # copy the file to specific directory
//     echo "Copying downloaded file"
//     cp  $filename $compose_file_path
//     echo "Copy was successful"
//       # Change to the directory where the Docker Compose file is located
//       cd $(dirname $compose_file_path)
//   #add currentuser to group
//       ${commandWithPass} usermod -aG docker $USER
//       #restart docker
//       ${commandWithPass} systemctl restart docker
//       # Run Docker Compose
//       # starting docker daemon
//       #syetemctl start docker
//       ${commandWithPass} docker compose up -d
//   else
//       echo "Failed to download Docker Compose file."
//   fi
  
//   #run the docker-compose file
//   #enable the service to cbt service to run on startup of the computer`;
// }

function getFlashCbtCommandNew(pass: string) {
  const commandWithPass = `echo ${pass} | sudo -S;`;
  return `#download docker-compose file
  #download url to the docker-compose file
  compose_url="http://192.169.152.77/home/DownloadComposeFile"
  filename=docker-compose.yml
  # Destination path to save the Docker Compose file
  compose_file_path="/usr/bin"
  #delete file if already exist in the current path
  
  if [ -f "$filename" ] ; then
      rm "$filename"
      echo "Deleted existing Docker-File in current path"
  fi
  #delete file if already exist in the Destination path
  destinationfile=$compose_file_path/$filename
  
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
    echo "Moving downloaded file"
    mv  $filename $compose_file_path
    echo "Copy was successful"
      # Change to the directory where the Docker Compose file is located
      cd $(dirname $compose_file_path)
  #add currentuser to group
      ${commandWithPass} usermod -aG docker $USER
      #restart docker
      ${commandWithPass} systemctl restart docker
      # Run Docker Compose
      # starting docker daemon
      #syetemctl start docker
      #${commandWithPass} docker compose up -d
  else
      echo "Failed to download Docker Compose file."
  fi
  
  #run the docker-compose file
  #enable the service to cbt service to run on startup of the computer
  #Define content
content="[Unit]
Description=Jamb CBT Flash Web Application
Requires=docker.service
After=docker.service
[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/usr/bin
ExecStart=/usr/bin/docker compose up -d --remove-orphans
ExecStop=/usr/bin/docker compose down
[Install]
WantedBy=multi-user.target"

#specify the file name and destination directory
file_name="flashcbt_start_file.service"
destination_dir="/etc/systemd/system/"

#create the file with content
echo "$content">"$file_name"
#check if file already exist in destination directory and delete it
  destination_dir_file=$destination_dir/$file_name
  
  if [ -f "$destination_dir_file" ] ; then
      rm "$destination_dir_file"
      echo "Deleted existing flashcbtstartup-File in destination path"
  fi
#move the file to specified destination
mv "$file_name" "$destination_dir"
#enable the service
${commandWithPass} systemctl enable "$file_name"
#start service
${commandWithPass} systemctl start "$file_name"
#restarting docker daemon
echo "restarting docker daemon"
${commandWithPass} systemctl restart docker`;
}

// function getDockerCommandNew(pass: string){

// }

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
  checkAppLocalVersion();
});

ipcMain.on("install-docker", function (e, pass) {
  console.log("install docker");
  if (process.platform === "win32") {
    win.webContents.send("error", "Can not wrong command on Windows");
    return;
  }
  installDocker(pass);
});

ipcMain.on("install-flashcbt", async function (e, pass) {
  console.log("install FlashCbt");
  // if (process.platform === "win32") {
  //   win.webContents.send("error", "Can not wrong command on Windows");
  //   return;
  // }
  await installFlashCbt(pass)
});

async function checkDockerInstallation() {
  const promise = new Promise((res, rej) => {
    exec(`docker -v`, (error, stdout, stderr) => {
      if (error) {
        rej(error)
      }
      if (stderr) {
       rej(Error(stderr))
      }
      res(stdout)
    });
  })
  return await promise
}

function installDocker(pass: string) {

  
  const command = getDockerCommand(pass);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      win.webContents.send('error', error.message.slice(0, 250))
      return;
    }
    if (stderr) {
      win.webContents.send('error', stderr)
      return;
    }
    if (stdout){
      win.webContents.send('info', stdout)
    }
   
  });
}

async function installFlashCbt(pass: string) {

  const command = getFlashCbtCommandNew(pass);

  const dockercommand = getDockerCommand(pass);
  
  exec(dockercommand, (docerror, docstdout, docstderr) => {
    if (docerror) {
      win.webContents.send('error', docerror.message.slice(0, 250))
      return;
    }
    if (docstderr) {
      win.webContents.send('error', docerror)
      return;
    }
    if (docstdout){
      exec(command, (error, stdout, stderr) => {
        if (error) {
          win.webContents.send('error', error.message.slice(0, 250))
          return;
        }
        if (stderr) {
          win.webContents.send('error', stderr)
          return;
        }
        if (stdout){
          win.webContents.send('info', stdout)
        }
      
      });
    }
   
  });

  

}

// Call the function to check Docker installation

function checkAppLocalVersion(){
  if (process.platform === "win32") {
    return;
  }
  const command = getLocalVersion();
  exec(command, (error, stdout, stderr) => {
    if (error) {
      win.webContents.send("error", error.message.slice(0, 250));
    }
    if (stderr) {
      win.webContents.send("error", stderr);
    }
    win.webContents.send("cbt-v", stdout);
  });
}



