const { ipcRenderer } = require("electron")

const $ = (selector: string) => document.querySelector(selector);

let script = ''

const busApi = `https://hub.docker.com/v2/repositories/olisco/flashcbt_consumer_v0/`;
const clientApi = `https://hub.docker.com/v2/repositories/olisco/flashcbt_client_v0/`;

const flashcbtVersion = $("#cbt-v");
const flashcbtBtn = $("#cbt-btn")
// const flashBusVersion = $("cbt-bus-v");
// const flashBusBtn = $("cbt-bus-btn");
const dockerVersion = $("#docker-v");
const dockerbtn = $("#docker-btn");

const busStatus = $("#cbt-bus-status");
const clientStatus = $("#cbt-client-status");
const statusCheckBtn = $(`#status-check`);
const passwordModal = $(`#passwordModal`) as HTMLDivElement
const password = $(`#password`) as HTMLInputElement

if (statusCheckBtn) {
  statusCheckBtn.addEventListener("click", getStatusUpdate);
}

// if (dockerbtn){
//     dockerbtn.addEventListener('click', () => {
//       // const pass = prompt('Enter Machine password:')
//       // if (!pass)
//       ipcRenderer.send('install-docker', 'chemistry')
//     })
// }

// if (flashcbtBtn){
//     flashcbtBtn.addEventListener('click', () => {
//       // const pass = prompt('Enter Machine password:')
//       // if (!pass)
//       ipcRenderer.send('install-flashcbt', 'chemistry')
//     })
// }

async function checkDockerLastUpdated(url: string) {
  try {
    // if (statusCheckBtn) {
    //   statusCheckBtn.innerHTML = "Loading...";
    // }
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const resData = await res.json();
    // if (statusCheckBtn) {
    //   statusCheckBtn.innerHTML = "Check";
    // }
    return resData.last_updated;
  } catch (error: any) {
    // if (statusCheckBtn) {
    //   statusCheckBtn.innerHTML = "Check";
    // }
  }
}

async function getStatusUpdate() {
  const client = await checkDockerLastUpdated(clientApi);
  const bus = await checkDockerLastUpdated(busApi);

  const clientDate = formatDate(client);
  const busDate = formatDate(bus);

  if (busStatus) {
    busStatus.innerHTML = busDate;
  }

  if (clientStatus) {
    clientStatus.innerHTML = clientDate;
  }
}

getStatusUpdate();

function formatDate(date: string) {
  const _date = new Date(date);
  return _date.toLocaleString();
  // const month = date.getMonth() + 1
  // const year = date.getFullYear();
  // const _date = date.getDate()

  // const hour = date.getHours()
  // const mins = date.getMinutes()

  // return `${_date}/${month}/${year}, ${hour}/${mins}`
}

function openPasswordModal(_script: string) {
  script = _script
  const passwordModal = document.getElementById("passwordModal");
  if (passwordModal) passwordModal.style.display = "block";
  
}

// Function to close the password modal
function closePasswordModal() {
  if (passwordModal) passwordModal.style.display = "none";
  
}

// Function to handle password submission (you can customize this)
function submitPassword() {
  if (password){
    const value = password.value
    console.log("Entered Password:", value);
    ipcRenderer.send(script, value)
    closePasswordModal();
  }
  // Here, you can handle password validation or any action upon submission
  
  
}

ipcRenderer.send('check-app-versions')


ipcRenderer.on('docker-v', (e, res) => {
    console.log(res)

    if (dockerVersion){
        dockerVersion.innerHTML = res[1]
    }
})

ipcRenderer.on('error', (e, res) => {
    alert(res)
})

ipcRenderer.on('process', (e, res) => {
  console.log(res, 'process')
})

ipcRenderer.on('process-err', (e, res) => {
  console.log(res, 'process-err')
})


ipcRenderer.on('info', (e, res) => {
  console.log(res, 'info')
})