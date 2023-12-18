const { ipcRenderer } = require("electron")

const $ = (selector: string) => document.querySelector(selector);

let script = ''
// let loading = false
let currentDigest = 'sha256:d07f0a4e111eee65b07345ee794a661d26858d743385fe902f237410644a2183'

const busApi = `https://hub.docker.com/v2/repositories/olisco/flashcbt_consumer_v0/`;
const clientApi = `https://hub.docker.com/v2/repositories/olisco/flashcbt_client_v0/`;
const ImageVersion = `https://hub.docker.com/v2/repositories/olisco/flashcbt_client/tags`

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
const loaderModal = $(`#loader`) as HTMLDivElement
const infoModal = $(`#info`) as HTMLDivElement
const infoData = $(`#info-data`) as HTMLHeadElement

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
    return resData.last_updated
  } catch (error: any) {
    // if (statusCheckBtn) {
    //   statusCheckBtn.innerHTML = "Check";
    // }
  }
}

function handleLoading(_loading: boolean){
  if (loaderModal){
    if (_loading){
      loaderModal.style.display = 'block'
    }else {
      loaderModal.style.display = 'none'
    }
  }
}

async function checkImageVersion(url: string) {
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
    return resData.results[0].digest
  } catch (error: any) {
    // if (statusCheckBtn) {
    //   statusCheckBtn.innerHTML = "Check";
    // }
  }
}

async function getStatusUpdate() {
  if (!navigator.onLine) return
  const image = await checkImageVersion(ImageVersion);
  // console.log(image)
  if (dockerbtn){
    if (image !== currentDigest){
      dockerbtn.innerHTML = 'Update'
    }else {
      dockerbtn.innerHTML = 'Install'
    }
    
  }
  
  // const client = await checkDockerLastUpdated(clientApi);
  // const bus = await checkDockerLastUpdated(busApi);

  // const clientDate = formatDate(client);
  // const busDate = formatDate(bus);

  // if (busStatus) {
  //   busStatus.innerHTML = busDate;
  // }

  // if (clientStatus) {
  //   clientStatus.innerHTML = clientDate;
  // }
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

function closeInfoModal() {
  if (infoModal) infoModal.style.display = "none";
  
}

// Function to handle password submission (you can customize this)
function submitPassword() {
  if (password){
    const value = password.value
    ipcRenderer.send(script, value)
    password.value = ''
    closePasswordModal();
  }
  // Here, you can handle password validation or any action upon submission
  
  
}

ipcRenderer.send('check-app-versions')


ipcRenderer.on('docker-v', (e, res) => {
    console.log(res)
})

ipcRenderer.on('cbt-v', (e, res) => {
  console.log(res)
})

ipcRenderer.on('error', (e, res) => {
    alert(res)
})

ipcRenderer.on('loading', (e, res : boolean) => {
  handleLoading(res)
})

ipcRenderer.on('process', (e, res) => {
  console.log(res, 'process')
})

ipcRenderer.on('process-err', (e, res) => {
  console.log(res, 'process-err')
})


ipcRenderer.on('info', (e, res) => {
  console.log(res, 'info')
  if (infoModal && infoData){
    infoData.innerHTML = res
    infoModal.style.display = 'block'
  }
})

window.addEventListener('online', getStatusUpdate);