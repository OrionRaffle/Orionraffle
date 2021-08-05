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
    label: 'Kith EU'
}
const DEV = true;

// Obligatoire pour la sélection de raffle cf. getAllRaffle
async function getSessionId(proxyConfig, user) {
    let sessionId
    // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    // console.log(proxyConfig)
    // proxyConfig = {
    //     host: proxyConfig.split('@')[1].split(':')[0],
    //     port: proxyConfig.split('@')[1].split(':')[1],
    //     auth: {
    //         username: proxyConfig.split('//')[1].split(':')[0],
    //         password: proxyConfig.split('//')[1].split(':')[1].split('@')[0].replace(/\n|\r/g, ""),
    //     },

    // }

    // console.log(proxyConfig)
    try {
        const response = await axios({
            // proxy: `http://${proxyConfig.auth.username}:${proxyConfig.auth.password}@${proxyConfig.host}:${proxyConfig.port}`,
            // proxy: {
            //     host:'127.0.0.1',
            //     port:'8888'
            // },
            proxy:proxyConfig,
            withCredentials: true,
            method: 'POST',
            followAllRedirects: true,
            resolveWithFullResponse: true,
            maxRedirects: 2,
            headers: { //Headers minimum obligatoire
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
            },
            url: 'https://eu.kith.com/account/login',
            body: qs.stringify({
                'form_type': 'customer_login',
                'utf8': '✓',
                'customer[email]': user.email, //Email
                'customer[password]': user.password, //Password
                'return_url': '/account'
            }),
        })
        //Cette condition permet de vérifier si la redirection va sur /account dans le cas contraire, c'est un problème de login (email or password incorrect)

    } catch (err) {
        console.log(err)

        // console.log(err.response.request.res)
        try {

            if (err.response.data.includes('"https://eu.kith.com/account"')) {
                sessionId = err.response.request.res.headers['set-cookie'][0].split('secure_session_id=')[1].split(';')[0]
                return sessionid
            }
        } catch (e) {

            return handleProxyError(err) 
        }
    }
}

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
            url: `https://eu.kith.com/pages/drawings-list`,
        })
        const body = response.data;
        //Récupération du title et de lien
        for (let i = 0; i < body.split('"drawings__drawing"').length - 1; i++) {
            let raffle = {};
            str = body.split('"drawings__drawing"')[i + 1].split('<a href="')[1];
            raffle.link = str.split('"')[0];

            raffle.title = str.split('drawings__title">')[1].split('<')[0];
            raffleTab.push(raffle);
        }
        return raffleTab;
    } catch (err) { return handleProxyError(err); }
}
//Récupération de l'id de chaque raffle
async function getCampaignId(raffle, sessionId) {
    try {
        const response = await axios({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
                'Cookie': '_secure_session_id=' + sessionId
            },
            withCredentials: true,
            method: 'GET',
            url: raffle.link,
        });
        raffle.campaignId = response.data.split("'campaignId': '")[1].split("'")[0];
        raffle.currentDate = response.data.split("currentDate': '")[1].split("'")[0]
    } catch (err) { return handleProxyError(err); }
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
                    raffle.secretCustomerId = data.split('"secretCustomerId"')[1].split('"stringValue": "')[1].split('"')[0];
                    raffle.models = data.split('/models/')[1].split('"')[0];
                    raffle.modelName = data.split('"campaign_name"')[1].split(`stringValue": "`)[1].split('""')[0] + '"'


                    getRaffleStatus3(raffle);
                    getRaffleStatus4(raffle);
                }
                if (data.includes("/locations/") && ((step === 1) || (step === 2))) {
                    raffle.location = data.split('/locations/')[1].split('"')[0];



                    if (raffle.location.length !== 20) return;

                    if (step === 1) {
                        getRaffleStatus5(raffle);
                        getRaffleStatus6(raffle);
                        step = 2;
                        raffle.locationName = data.split(`"locationName"`)[1].split(`"stringValue": "`)[1].split('"')[0];
                    }

                    if (raffle.type === 'Instore' && data.includes('Kith Paris')) {
                        raffle.location = data.split('/locations/')[2].split('"')[0];
                        raffle.locationName = 'Kith Paris'

                        getRaffleStatus7(raffle);
                        getRaffleStatus8(raffle);
                        if (DEV) console.log('Step 1 completed');
                        step = 3;
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
                            if (isNaN(stock)) stock = '0';
                            let size = sizeString[i + 1].split('stringValue": "')[1].split(' U')[0].trim();
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
    await csvReadProxy(handleProxies);
    async function handleProxies(proxies) {
        if (proxies.length === 0) return reinitProgram(`Proxy required for ${moduleK.label}`);

        var proxyConfig = await getAnotherProxy(proxies);

        displayModule(moduleK.label);
        logInfo('Orion is getting raffle data. (It can last a few seconds).');

        const sessionId = await getSessionId(proxyConfig, user);
        if (sessionId === null) {
            logInfo('Proxy error, rotating proxy', true);
            await sleep(2000);
            return await getAllRaffle(user);
        }
        var raffleTab = await getRaffleName();
        if (raffleTab === null) return;

        for (i = 0; i < raffleTab.length; i++) {
            if (DEV) console.log('Raffle : ' + raffleTab[i].title);
            await getCampaignId(raffleTab[i], sessionId);
            await getSessionFireBase(raffleTab[i]);

            await getRaffleStatus(raffleTab[i]);
            await getRaffleStatus2(raffleTab[i]);

            var res = await getRaffleInfo(raffleTab[i]);
            if (!res) i--;
        }
        raffleData = raffleTab;
    }
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
        'email': 'clementTest@gmail.com',
        'password': 'POKEMON1'
    };
    const raffleData = await getAllRaffle(user);
    console.log(raffleData)
    return raffleData;
}

// getDataRaffle()
module.exports = {
    getDataRaffle
}