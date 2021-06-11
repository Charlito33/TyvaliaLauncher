const https = require("https");
const ping = require("ping");

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

/*
if (!proxyData.startsWith("http")) {
                proxy = "http://" + proxyData;
            } else {
                proxy = proxyData;
            }
            if (proxy.endsWith("/")) {
                proxy = proxy.slice(0, -1);
            }
 */

function getProxiesList(host, path) {
    return new Promise(function (resolve, reject) {
        let options = {
            host: host,
            path: path
        };

        let request = https.request(options, function (res) {
            let data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data.split(", "));
            })
        });
        request.on('error', function (e) {
            console.log("Proxy Finder Error : " + e.message);
        });
        request.end();
    });
}

function pingProxiesList(proxies) {
    return new Promise(function (resolve, reject) {
        let aliveProxies = [];
        let checked = 0;


        proxies.forEach(function (host) {
            let hostCheck = host;
            hostCheck = hostCheck.replace("https://", "");
            hostCheck = hostCheck.replace("http://", "");
            hostCheck = hostCheck.split("/")[0];

            ping.sys.probe(hostCheck, function (isAlive) {
               if (isAlive) {
                   aliveProxies.push(host);
               }

                checked++;

                if (checked === proxies.length) {
                    resolve(aliveProxies);
                }
            });
        });
    });
}

function getRandomProxy(proxies) {
    return proxies[getRandomIntInclusive(0, proxies.length - 1)];
}

module.exports = {
    getProxiesList, pingProxiesList, getRandomProxy
}