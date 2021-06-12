const { ipcRenderer, session } = require('electron');

let selectedRAM = 2;

function launchButton() {
    ipcRenderer.invoke('setPreference', 'username', document.getElementById("username").value);
    ipcRenderer.invoke('setPreference', 'ram', selectedRAM);
    ipcRenderer.invoke('launch', document.getElementById("username").value, selectedRAM);
}

ipcRenderer.on("noUsername", (event, ...args) => {
   document.getElementById("errorMessageUsername").style.display = "block";
});

ipcRenderer.on("launch", (event, ...args) => {
    document.getElementById("submitButton").value = "Lancement...";
    document.getElementById("submitButton").disabled = true;
    document.getElementById("launchMessage").style.display = "block";
});

ipcRenderer.on("updatePercent", (event, ...args) => {
    document.getElementById("launchMessage").innerHTML = "<br />" + args[0] + "%";
});

ipcRenderer.on("writeData", (event, ...args) => {
    document.write(args[0] + "<br />");
});

ipcRenderer.on("getTotalRAM", (event, ...args) => {
    document.getElementById("ram-selector").max = args[0];
});

ipcRenderer.on("setPreferences", (event, ...args) => {
    document.getElementById("username").value = args[0];
    selectedRAM = args[1];
    document.getElementById("ram-selector").value = selectedRAM;
    document.getElementById("ram").innerHTML = selectedRAM;
});

window.addEventListener('load', (event) => {
    ipcRenderer.invoke("load");

    document.getElementById("ram-selector").addEventListener("input", () => {
        selectedRAM = document.getElementById("ram-selector").value
        document.getElementById("ram").innerHTML = selectedRAM;
    });

    document.getElementById("musicPlayer").volume = 0.2;
    document.getElementById("errorMessageUsername").style.display = "none";
    document.getElementById("launchMessage").style.display = "none";
});
