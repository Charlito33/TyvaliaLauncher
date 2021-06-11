const { ipcRenderer } = require('electron');

function launchButton() {
    ipcRenderer.invoke('launch', document.getElementById("username").value);
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


window.addEventListener('load', (event) => {
    document.getElementById("submitButton").addEventListener("click", (event) => {
        if (document.getElementById("username") !== undefined && document.getElementById("username") !== "") {
            setCookie("username", btoa(document.getElementById("username").value));
        }
    });

    if (cookieExists("username")) {
        document.getElementById("username").value = atob(readCookie("username"));
    }

    document.getElementById("musicPlayer").volume = 0.2;
    document.getElementById("errorMessageUsername").style.display = "none";
    document.getElementById("launchMessage").style.display = "none";
});



function setCookie(index, value) {
    document.cookie = index + "=" + value;
}

function cookieExists(index) {
    return document.cookie.split(";").some((item) => {if (item.includes(index + "=")) return true});
}

function readCookie(index) {
    if (!cookieExists(index)) return null;
    let value = "";
    document.cookie.split(";").some((item) => {if (item.includes(index + "=")) value = item.split("=")[1]});
    return value;
}

function removeCookie(index) {
    document.cookie = index + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT"
}