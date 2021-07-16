const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const request = require('request-promise').defaults({
    jar: true
});
const path = require('path');
var randomstring = require("randomstring");
const fetch = require('node-fetch');
const console = require('console');
const { csvReadProxy } = require('../../../utils/csvReader')


const {
    displayModule,
    logError,
    logInfo,
} = require('../../../utils/console');

const {
    handleProxyError,
    sleep,
    reinitProgram
} = require('../../../utils/utils');

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const moduleK = {
    label: 'Xhibition'
}
const DEV = false;

// Obligatoire pour la sélection de raffle cf. getAllRaffle


async function getRaffleName() {
    var raffleTab = [];

    try {
        const response = await axios({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
            },
            withCredentials: true,
            method: 'GET',
            url: `https://xhibition.co/pages/launches`,
        })
        const body = response.data;
        //Récupération du title et de 
    
       
        for (let i = 0; i < body.split('/pages/raffle-').length - 1; i++) {
            let raffle = {};
            str = body.split('/pages/raffle-')[i + 1]
            
            raffle.link = str.split('"')[0];
            raffle.link = 'https://xhibition.co/pages/raffle-' + raffle.link
            str2 = str
            raffle.title = str.split('"h6 text-upper text-strong grid-view-item__vendor">')[1].split('<')[0];
            title2 = str2.split('grid-view-item__title">')[1].split('<')[0]
            
            raffle.title = raffle.title + ' ' + title2
         raffleTab.push(raffle);
        }
        
    
        return raffleTab;
        
    } catch (err) { console.log(err) }
}
//Récupération de l'id de chaque raffle
async function getCampaignId(raffle) {
    try {
        const response = await axios({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
               
            },
            withCredentials: true,
            method: 'GET',
            url: raffle.link,
        });
        raffle.currentDate = response.data.split("currentDate': '")[1].split("'")[0]
        raffle.campaignId = response.data.split("'campaignId': '")[1].split("'")[0];
    } catch (err) { console.log(err); }
}

//Récupération du SID et du gessionid pour récuperer les données via FireBASE
const getSessionFireBase = async (raffle) => {
    let dataLogin = {}
    try {
        const response = await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: true,
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'RID': getRandomIntInclusive(1000, 99999),
                'CVER': '22',
                'X-HTTP-Session-Id': 'gsessionid',
                '$httpHeaders': 'X-Goog-Api-Client:gl-js/ fire/7.23.0 Content-Type:text/plain',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '0',
                'req0___data__': `{"database": "projects/launches-by-seed/databases/(default)","addTarget": { "documents": { "documents": ["projects/launches-by-seed/databases/(default)/documents/campaigns/${raffle.campaignId}"]}, "targetId": 2 }}`

            })
        })
        dataLogin.SID = response.data.split('","')[1];
        dataLogin.gsessionid = response.headers['x-http-session-id'];
        raffle.dataLogin = dataLogin;
    } catch (err) { return handleProxyError(err); }
}


async function getRaffleInfo(raffle) {
    var init = {
        method: 'GET',
        headers: {
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
            "Accept": "*/*",
            "Accept-Language": "fr-fr",
            "Accept-Encoding": "gzip, deflate, br",
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        mode: 'cors',
        
        cache: 'default',
    };
    var chunkedUrl = `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&gsessionid=${raffle.dataLogin.gsessionid}&VER=8&RID=rpc&SID=${raffle.dataLogin.SID}&CI=0&AID=0&TYPE=xmlhttp&zx=${randomstring.generate(11).toLowerCase()}&t=1`;

    var step = 0;
    let data = '';
    const promise = new Promise(async function (resolve) {
        await fetch(chunkedUrl, init).then(response => response.body)
            .then(res => res.on('readable', () => {
                function testStep(oldStep) {
                    if (oldStep === step) resolve();
                }

                const chunk = res.read();
                if (chunk === null) return;
                data = data + chunk.toString();
                
                if (data.includes('Pick Up')) raffle.type = 'Instore';
                else raffle.type = 'Online';

                if (data.includes('/models') && data.includes('status') && (step === 0)) {
                    if (DEV) console.log('Step 0 completed');
                    step = 1;
                    setTimeout(testStep, 10 * 1000, step);
                    raffle.status = data.split('"status"')[1].split('"stringValue": "')[1].split('"')[0];
                    raffle.models = data.split('/models/')[1].split('"')[0];
                    raffle.modelName = data.split('/models/')[1].split(`"stringValue": "'`)[1].split("'")[0]
                    getRaffleStatus3(raffle);
                    getRaffleStatus4(raffle);   
                }
              

                if (data.includes("/locations/") && ((step === 1) || (step === 2))) {
                   
                    raffle.location = data.split('/locations/')[1].split('"')[0];
                    raffle.locationName = 'Xhibition.co (Online)'
                    if (raffle.location.length !== 20) return;

                    if (step === 1) {
                        getRaffleStatus5(raffle);
                        getRaffleStatus6(raffle);
                        step = 2;
                    }

                
                    if (raffle.type === 'Online') {
                        getRaffleStatus7(raffle);
                        getRaffleStatus8(raffle);
                        if (DEV) console.log('Step 1 completed');
                        step = 3;
                    }
                }
                if (data.includes('"inventory"') && chunk.toString().includes('targetChange') && (step === 3)) {
                    let inventory = [];
                    let sizes = [];

                    const stockString = data.split('"inventory"');
                    const sizeString = data.split('"size"');

                    try {
                        for (let i = 0; i < stockString.length; i++) {
                            if (stockString[i + 1].split('stringValue": "')[1] === undefined) stock = '0'
                            else stock = stockString[i + 1].split('stringValue": "')[1].split('"')[0];
                            stock = '0';
                            let size = sizeString[i + 1].split('stringValue": "')[1].split('"')[0].trim();
                            sizes.push(size);
                            inventory.push(stock);
                        }
                    } catch (e) { }
                    raffle.sizes = sizes;
                    if (raffle.type === 'Online') raffle.inventory = inventory;
                    if (DEV) console.log('Step 3 completed');
                    resolve();
                }
            }))
    });
    await promise;
    return step === 3;
}

async function getRaffleStatus(raffle) {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': raffle.dataLogin.gsessionid,
                'SID': raffle.dataLogin.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'CI': '0',
                'AID': '4',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '1',
                'req0___data__': `{"database":"projects/launches-by-seed/databases/(default)","removeTarget":2}`
            })
        })
    } catch (err) { return handleProxyError(err); }
}
async function getRaffleStatus2(raffle) {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': raffle.dataLogin.gsessionid,
                'SID': raffle.dataLogin.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'CI': '0',
                'AID': '4',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '2',
                'req0___data__': `{"database":"projects/launches-by-seed/databases/(default)","addTarget":{"query":{"structuredQuery":{"from":[{"collectionId":"models"}],"orderBy":[{"field":{"fieldPath":"name"},"direction":"ASCENDING"},{"field":{"fieldPath":"__name__"},"direction":"ASCENDING"}]},"parent":"projects/launches-by-seed/databases/(default)/documents/campaigns/${raffle.campaignId}"},"targetId":4}}`
            })
        })
    } catch (err) { return handleProxyError(err); }
}


const getRaffleStatus3 = async (raffle) => {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': raffle.dataLogin.gsessionid,
                'SID': raffle.dataLogin.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'CI': '0',
                'AID': '4',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '3',
                'req0___data__': `{"database":"projects/launches-by-seed/databases/(default)","removeTarget":4}`
            })
        })
    } catch (err) { return handleProxyError(err); }
}

const getRaffleStatus4 = async (raffle) => {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': raffle.dataLogin.gsessionid,
                'SID': raffle.dataLogin.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'CI': '0',
                'AID': '4',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '4',
                'req0___data__': `{"database":"projects/launches-by-seed/databases/(default)","addTarget":{"query":{"structuredQuery":{"from":[{"collectionId":"locations"}],"orderBy":[{"field":{"fieldPath":"locationName"},"direction":"ASCENDING"},{"field":{"fieldPath":"__name__"},"direction":"ASCENDING"}]},"parent":"projects/launches-by-seed/databases/(default)/documents/campaigns/${raffle.campaignId}/models/${raffle.models}"},"targetId":6}}`
            })
        })
    
    } catch (err) { return handleProxyError(err); }
}

const getRaffleStatus5 = async (raffle) => {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',

            },
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': raffle.dataLogin.gsessionid,
                'SID': raffle.dataLogin.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'CI': '0',
                'AID': '4',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '5',
                'req0___data__': `{"database":"projects/launches-by-seed/databases/(default)","removeTarget":6}`
            })
        })
    } catch (err) { return handleProxyError(err); }
}

const getRaffleStatus6 = async (raffle) => {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': raffle.dataLogin.gsessionid,
                'SID': raffle.dataLogin.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'CI': '0',
                'AID': '4',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '6',
                'req0___data__': `{"database":"projects/launches-by-seed/databases/(default)","addTarget":{"query":{"structuredQuery":{"from":[{"collectionId":"sizes"}],"orderBy":[{"field":{"fieldPath":"sizeOrder"},"direction":"ASCENDING"},{"field":{"fieldPath":"__name__"},"direction":"ASCENDING"}]},"parent":"projects/launches-by-seed/databases/(default)/documents/campaigns/${raffle.campaignId}/models/${raffle.models}/locations/${raffle.locations}"},"targetId":8}}`
            })
        })
    } catch (err) { return handleProxyError(err); }
}


const getRaffleStatus7 = async (raffle) => {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': raffle.dataLogin.gsessionid,
                'SID': raffle.dataLogin.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'CI': '0',
                'AID': '4',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '7',
                'req0___data__': `{"database":"projects/launches-by-seed/databases/(default)","removeTarget":8}`
            })
        })
    } catch (err) { return handleProxyError(err); }
}

const getRaffleStatus8 = async (raffle) => {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',

            },
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': raffle.dataLogin.gsessionid,
                'SID': raffle.dataLogin.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'CI': '0',
                'AID': '4',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '8',
                'req0___data__': `{"database":"projects/launches-by-seed/databases/(default)","addTarget":{"query":{"structuredQuery":{"from":[{"collectionId":"sizes"}],"orderBy":[{"field":{"fieldPath":"sizeOrder"},"direction":"ASCENDING"},{"field":{"fieldPath":"__name__"},"direction":"ASCENDING"}]},"parent":"projects/launches-by-seed/databases/(default)/documents/campaigns/${raffle.campaignId}/models/${raffle.models}/locations/${raffle.location}"},"targetId":10}}`
            })
        })
    } catch (err) { return handleProxyError(err); }
}

//Récupération
async function getAllRaffle(user) {
    var raffleData;


        displayModule(moduleK.label);
        logInfo('Orion is getting raffle data. (It can last a few seconds).');

        // const sessionId = await getSessionId(proxyConfig, user);
        // if (sessionId === null) {
        //     logInfo('Proxy error, rotating proxy', true);
        //     await sleep(2000);
        //     return await getAllRaffle(user);
        // }
        var raffleTab = await getRaffleName();
        if (raffleTab === null) return;
    
        for (i = 0; i < raffleTab.length; i++) {
            if (DEV) console.log('Raffle : ' + raffleTab[i].title);
            await getCampaignId(raffleTab[i]);
           
            await getSessionFireBase(raffleTab[i]);

            await getRaffleStatus(raffleTab[i]);
            await getRaffleStatus2(raffleTab[i]);
           

            var res = await getRaffleInfo(raffleTab[i]);
            if (!res) i--;
        
        raffleData = raffleTab;
    }
    console.log(raffleData)
    return raffleData;
}

async function getAnotherProxy(proxies) {
    if (proxies.length === 0) throw 'No more proxies';
    const proxy = proxies.shift();
    return {
        host: proxy.ip,
        port: proxy.port,
        auth: {
            username: proxy.user,
            password: proxy.password
        }
    };
}

async function getDataRaffle() {
    const user = {
        'email': 'bastien-bouge@hotmail.fr',
        'password': 'yoloyolo'
    };
    const raffleData = await getAllRaffle(user);
    // console.log(raffleData)
    return raffleData;
}
// getDataRaffle()
module.exports = {
    getDataRaffle
}

