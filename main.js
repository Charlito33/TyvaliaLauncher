const {app, BrowserWindow} = require('electron');
const {ipcMain, dialog} = require('electron');
const proxiesChecker = require('./proxies-checker');

const getAppDataPath = require('appdata-path');
const {Menu} = require("electron");
const {Client, Authenticator} = require('minecraft-launcher-core');
const launcher = new Client();
const client = require('discord-rich-presence')('816244631859363870');

let win = null;
let gamePath = getAppDataPath() + "\\.tyvaliaRP";
let rendererProcess = null;

let proxiesListHost = "pastebin.com";
let proxiesListPath = "/raw/nasFzNFe";

let appReady = false;
let proxy = "";

proxiesChecker.getProxiesList(proxiesListHost, proxiesListPath).then((data) => {
    console.log("Proxies : " + data);

    proxiesChecker.pingProxiesList(data).then((data) => {
        if (data.length === 0) {
            dialog.showErrorBox("Erreur de Connexion !", "Aucun proxy trouvé !\nVeuillez vérifier votre connexion ou contacter le support !");
            app.quit();
            return;
        }

        console.log("Alive Proxies : " + data);
        proxy = proxiesChecker.getRandomProxy(data);
        console.log("Proxy : " + proxy);
        app.whenReady().then(createWindow);
    })
})


client.updatePresence({
    state: 'Joue sur le Serveur',
    details: 'https://tyvalia-rp.fr.nf/discord',
    startTimestamp: new Date(),
    largeImageKey: 'tyvaliabackground',
    largeImageText: 'Serveur RP 1.12.2',
    smallImageKey: 'tyvalialogo',
    smallImageText: 'TyvaliaRP'
    //partyId: 'tyvaliaRP',
    //partySize: 1,
    //partyMax: 5
});

async function launchGame(args) {
    await gameLaunch(args[0]);
}

async function gameLaunch(username) {
    let opts = {
        clientPackage: proxy + "/modpack.zip",
        authorization: Authenticator.getAuth(username),
        root: gamePath,
        version: {
            number: "1.12.2",
            type: "release"
        },
        memory: {
            max: "6G",
            min: "3500M"
        },
        forge: gamePath + "\\bin\\modpack.jar"
    };

    launcher.launch(opts);

    launcher.on('debug', (e) => console.log(e));
    launcher.on('data', (e) => console.log(e));
    launcher.on('download-status', (e) => {
        if (rendererProcess != null) {
            rendererProcess.send("updatePercent", ((e.current / e.total) * 100).toFixed(2));
        }
    });
    launcher.on('data', (e) => {
        win.hide();
        rendererProcess.send("writeData", e);
    });
    launcher.on('close', (e) => {
        if (e === 0) {
            app.quit();
        } else {
            win.show();
        }
    })
}

function createWindow() {
    win = new BrowserWindow({
        width: 960,
        height: 540,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    });

    win.loadFile('index.html');
    Menu.setApplicationMenu(null);
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
   if (BrowserWindow.getAllWindows().length === 0) {
       createWindow();
   }
});

ipcMain.handle('launch', (event, ...args) => {
    if (args[0] === undefined || args[0] === "") {
        event.sender.send("noUsername");
    } else {
        rendererProcess = event.sender;
        event.sender.send("launch");
        launchGame(args);
    }

});
