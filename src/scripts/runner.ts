const { ipcRenderer } = require("electron")

const $ = (selector: string) => document.querySelector(selector);

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

if (statusCheckBtn) {
  statusCheckBtn.addEventListener("click", getStatusUpdate);
}

if (dockerbtn){
    dockerbtn.addEventListener('click', () => ipcRenderer.send('install-docker'))
}

if (flashcbtBtn){
    flashcbtBtn.addEventListener('click', () => ipcRenderer.send('install-flashcbt'))
}

async function checkDockerLastUpdated(url: string) {
  try {
    if (statusCheckBtn) {
      statusCheckBtn.innerHTML = "Loading...";
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const resData = await res.json();
    if (statusCheckBtn) {
      statusCheckBtn.innerHTML = "Check";
    }
    return resData.last_updated;
  } catch (error: any) {
    if (statusCheckBtn) {
      statusCheckBtn.innerHTML = "Check";
    }
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
