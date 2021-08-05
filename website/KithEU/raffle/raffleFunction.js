const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const request = require('request-promise').defaults({
    jar: true
});
const { solvedHcaptcha } = require('../../../utils/2captcha');

const inputReader = require('wait-console-input')

const clear = require('console-clear')
const setTitle = require('node-bash-title')
const chalk = require('chalk')
const figlet = require('figlet')
const colors = require('colors')
const lineReader = require('line-reader')

var HttpsProxyAgent = require('https-proxy-agent');
var randomstring = require("randomstring");
const fetch = require('node-fetch');
var moment = require('moment');

var m = moment();

const { csvRaffleKith, csvReadProxy2 } = require('../../../utils/csvReader');

const {
    csvproxyreader,
    csvconfigreader,
} = require('../../../init')

const {
    displayKithRaffle,
    displayModule,
    displayKithRaffleRecap,
    displaySizeChoice,
    pressToQuit,
    displayRecap,
    percent,
    logError,
    logInfo,
    logSuccess
} = require('../../../utils/console');
const { DEV, CHARLES, siteKey, moduleK } = require('../kithEUConst');
const {
    handleProxyError
} = require('../../../utils/utils');

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// axios.defaults.timeout = 1000
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// const proxyConfig = 'http://16206265723739:hUo13ZOuhX74fN1i_country-France_session-162334362740@proxy.frappe-proxyData.com:31112';
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}


// Obligatoire pour la sélection de raffle cf. getAllRaffle
async function getSessionId(proxy, user) {
    try {
        await axios({
            proxy: proxy,
            withCredentials: true,
            method: 'POST',
            maxRedirects: 0,
            followRedirects: false,
            timeout: 5000,
            resolveWithFullResponse: true,

            headers: { //Headers minimum obligatoire
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
                'accept-encoding': 'gzip'
            },
            url: 'https://eu.kith.com/account/login',
            data: qs.stringify({
                'form_type': 'customer_login',
                'utf8': '✓',
                'customer[email]': user.Email, //Email
                'customer[password]': user.Password, //Password
                'return_url': '/account'
            }),
        })
    } catch (err) {
        if (await handleProxyError(err) !== null) return { code: 'PROXY', data: undefined }
        if (err.response.data.includes('"https://eu.kith.com/account"')) {
            let sessionId = err.response.request.res.headers['set-cookie'][0].split(';')[0].split('=')[1];
            return { code: 'SUCCESS', data: sessionId };
        }
        if (err.response.data.includes('"https://eu.kith.com/account/login?return_url=%2Faccount"')) return { code: 'UNKNOW_ACCOUNT', data: undefined }
        if (err.response.data.includes('"https://eu.kith.com/challenge"')) return { code: 'CHALLENGE', data: undefined }
        return { code: 'PROXY', data: undefined }
    }
}




//Récupération


//Login Obligatoire
async function getInformation(proxy, user, sessionId) {
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
            proxy: proxy,
            withCredentials: true,
            timeout: 10000,
            method: 'GET',
            url: 'https://eu.kith.com/account/addresses',
        })
        console.log(response)
        user.CustomerId = response.data.split('"customerId":')[1].split('}')[0];

        nbClose = response.data.split('<button class="account-address-modal__close" data-remodal-action="close">Close</button>').length;
        if (nbClose != 0) {
            data = response.data.split('<button class="account-address-modal__close" data-remodal-action="close">Close</button>')[nbClose - 1];
            user.FirstName = data.split('address[first_name]')[1].split('value="')[1].split('"')[0];
            user.LastName = data.split('address[last_name]')[1].split('value="')[1].split('"')[0];
            user.Address = data.split('address[address1]')[1].split('value="')[1].split('"')[0];
            user.Country = data.split('address[country]')[1].split('data-default="')[1].split('"')[0];
            user.City = data.split('address[city]')[1].split('value="')[1].split('"')[0];
            user.PostalCode = data.split('address[zip]')[1].split('value="')[1].split('"')[0];
            user.Phone = data.split('address[phone]')[1].split('value="')[1].split('"')[0];
            user.IdAddress = data.split('data-form-id="')[1].split('"')[0];
            user.Address_Count = String(data.split('address[first_name]').length - 1);
            return { code: 'SUCCESS', data: undefined };
        } else {
            return { code: 'ADRESS_MISSING', data: undefined }
        }
    } catch (err) {
     
        if (await handleProxyError(err) !== null) return { code: 'PROXY', data: undefined }
    }
    return { code: 'PROXY', data: undefined }
}
const getSIDandgessionid = async (proxy, user) => {
    try {
        const response = await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            proxy: proxy,
            withCredentials: true,
            timeout: 5000,
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'RID': getRandomIntInclusive(1000, 99999),
                'CVER': '22',
                'X-HTTP-Session-Id': 'gsessionid',
                '$httpHeaders': 'X-Goog-Api-Client:gl-js/ fire/7.23.0Content-Type:text/plain',
                'zx	': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '0',
                'req0___data__': '{"database": "projects/launches-by-seed/databases/(default)" }'
            })
        })

        user.SID = response.data.split('","')[1].split('"')[0]
        user.gsessionid = response.headers['x-http-session-id']

    } catch (err) {
        if (await handleProxyError(err) !== null) {
            return 'ERROR'
        }
    }
}

const kithEntry2 = async (proxy, user) => {
    try {
        await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
            },
            proxy: proxy,
            timeout: 5000,
            withCredentials: true,
            method: 'GET',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'gsessionid': user.gsessionid,
                'VER': '8',
                'RID': 'rpc',
                'SID': user.SID,
                'CI': '0',
                'AID': '0',
                'TYPE': 'xmlhttp',
                'zx': randomstring.generate(11).toLowerCase(),
                't': '1'
            },

        })
    } catch (err) {
        if (await handleProxyError(err) !== null) {
            return 'ERROR'
        }
    }
}

//Récupération du SID et du gsession, obligatoire pour les prochaes requêtes
const kithEntry3 = async (proxy, user, raffle) => {
    try {
        const response = await axios({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
            },
            proxy: proxy,
            timeout: 5000,
            withCredentials: true,
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': user.gsessionid,
                'SID': user.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'AID': '1',
                'zx	': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '1',
                'req0___data__': `{"streamToken":"GRBoQgKB9LW1","writes":[{"update":{"name":"projects/launches-by-seed/databases/(default)/documents/submissions/${raffle.campaignId}-${user.CustomerId}","fields":{"currentDate":{"stringValue":"${m.format()}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"customerId":{"stringValue":"${user.CustomerId}"},"type":{"stringValue":""},"size":{"stringValue":"${user.size} US"},"model":{"stringValue":"${raffle.models}"},"modelName":{"stringValue":"${raffle.modelName}"},"location":{"stringValue":"${raffle.location}"},"locationName":{"stringValue":"${raffle.locationName}"},"email":{"stringValue":"${user.Email}"},"phone":{"stringValue":"${user.Phone}"},"firstName":{"stringValue":"${user.FirstName}"},"lastName":{"stringValue":"${user.LastName}"},"zipCode":{"stringValue":"${user.PostalCode}"},"customerObject":{"mapValue":{"fields":{"currentDate":{"stringValue":"${raffle.currentDate}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"accepts_marketing":{"stringValue":"true"},"addresses":{"arrayValue":{"values":[{"mapValue":{"fields":{"address1":{"stringValue":"${user.Address}"},"address2":{"stringValue":""},"city":{"stringValue":"${user.City}"},"company":{"stringValue":""},"country":{"stringValue":"France"},"country_code":{"stringValue":"FR"},"first_name":{"stringValue":"${user.FirstName}"},"id":{"stringValue":"${user.IdAddress}"},"last_name":{"stringValue":"${user.LastName}"},"phone":{"stringValue":"${user.Phone}"},"province":{"stringValue":""},"province_code":{"stringValue":""},"street":{"stringValue":"${user.Address}"},"zip":{"stringValue":"${user.PostalCode}"}}}}]}},"addresses_count":{"stringValue":"${user.Address_Count}"},"email":{"stringValue":"${user.Email}"},"first_name":{"stringValue":"${user.FirstName}"},"has_account":{"stringValue":"true"},"id":{"stringValue":"${user.CustomerId}"},"last_name":{"stringValue":"${user.FirstName}"},"last_order":{"stringValue":""},"name":{"stringValue":"${user.FirstName} ${user.LastName}"},"orders_count":{"stringValue":"0"},"phone":{"stringValue":"${user.Phone}"},"tags":{"stringValue":""},"tax_exempt":{"stringValue":"false"},"total_spent":{"stringValue":"0"},"country":{"stringValue":"France"},"country_code":{"stringValue":"FR"},"ip":{"stringValue":"${user.ip}"}}}},"ip":{"stringValue":"109.209.0.71"},"processed":{"booleanValue":false},"mouseMoved":{"booleanValue":true},"customerMessage":{"stringValue":""},"country":{"stringValue":"France"},"countryCode":{"stringValue":"FR"},"site":{"stringValue":"kith-europe.myshopify.com"},"risk":{"stringValue":"null"},"captchaToken":{"stringValue":"${user.captcha}"},"synced":{"booleanValue":false},"isSyncing":{"booleanValue":false},"ccZip":{"stringValue":"not-set"},"ccBrand":{"stringValue":"not-set"},"ccCountry":{"stringValue":"not-set"},"ccLast4":{"stringValue":"not-set"},"groupId":{"integerValue":"${raffle.type == 'Online' ? '55' : '58'}"},"removeCustomerLogin":{"booleanValue":false},"emailOptIn":{"booleanValue":false},"secretCustomerId":{"stringValue":"${raffle.secretCustomerId}"}}}}]}`
            })
        })
        if (response.data.includes('1')) {
            return 'SUCCESS'
        } else {
            return 'ENTRY_FAILED'
        }
    } catch (err) {
        if (await handleProxyError(err) !== null) {
            return 'ERROR'
        }
    }
}

const kithEntry4 = async (proxy, user, raffle) => {
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
            proxy: proxy,
            timeout: 5000,
            withCredentials: true,
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': user.gsessionid,
                'SID': user.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'AID': '2',
                'zx	': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '2',
                'req0___data__': `{"streamToken":"EAEZEGhCAoH0tbU=","writes":[{"update":{"name":"projects/launches-by-seed/databases/(default)/documents/submission_tracking/${raffle.campaignId}-${user.CustomerId}","fields":{"currentDate":{"stringValue":"${m.format()}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"customerId":{"stringValue":"${user.CustomerId}"},"site":{"stringValue":"kith-europe.myshopify.com"},"email":{"stringValue":"${user.Email}"},"phone":{"stringValue":"${user.Phone}"},"ip":{"stringValue":"${user.ip}"}}}}]}`

            })
        })
    } catch (err) {
        if (await handleProxyError(err) !== null) {
            return 'ERROR'
        }
    }
}

const getIP = async (proxy) => {
    try {
        const resp = await axios({
            method: 'get',
            url: 'https://api.ipify.org?format=json',
            proxy: proxy,
            timeout: 5000,
        });
        return resp.data.ip

    } catch (err) {
        if (await handleProxyError(err) !== null) {
            return 'ERROR';
        }
    }
}
async function raffleKith(raffle) {
    // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


    // const proxyConfig = {
    //     host: '127.0.0.1',
    //     port: '8888',
    // }
    raffle = [{
        link: 'https://eu.kith.com/pages/kith-drawing-3-2',
        title: 'Paris Store Pick Up - Nike Air Jordan 1 Retro High "Electro Orange"',
        campaignId: '0iCIBZOtwvyUR75VKybt',
        currentDate: '2021-07-15T14:55:00.000-05:00',
        dataLogin: {
            SID: 'e43VuTG9lE9_O4R38iz81w',
            gsessionid: 'xtDscvQCpw5xyrqZ5yRsENj0QlN2MESu9JGA5TIRG-A'
        },
        type: 'Instore',
        status: 'open',
        secretCustomerId: '1626191115673_4819271',
        models: '6W5KYvF5MdLSwgvBXgSz',
        modelName: 'Paris Store Pick Up - Nike Air Jordan 1 Retro High \\"Electro Orange\\"',
        location: 'm66NNh8gQQK7SRTTIXlL',
        locationName: 'Kith Paris',
        sizes: [
            '7', '7.5', '8',
            '8.5', '9', '9.5',
            '10', '10.5', '11',
            '11.5', '12', '13'
        ]
    }]


    displayModule(moduleK.label);
    var choice = await displayKithRaffle(raffle);
    choice = parseInt(choice);
    while (choice < 0 || choice > raffle.length || isNaN(choice)) {
        logError('Invalid input.');
        await sleep(1000);
        displayModule(moduleK.label);
        choice = await displayKithRaffle(raffle);
        choice = parseInt(choice);
    }
    if (choice === 0) return;

    var currentRaffle = raffle[choice - 1];
    displayKithRaffleRecap(currentRaffle);
    var sizes = await displaySizeChoice(currentRaffle.sizes);
    var selectedSizes = [];
    while (selectedSizes.length === 0) {
        if (sizes.from <= sizes.to) {
            currentRaffle.sizes.forEach(element => {
                element = parseFloat(element);
                if (element < sizes.from) { }
                else if (element > sizes.to) { }
                else selectedSizes.push(element);
            })
            if (selectedSizes.length === 0) {
                logError('Invalid input.');
                await sleep(1000);
                displayKithRaffleRecap(currentRaffle);
                sizes = await displaySizeChoice(currentRaffle.sizes);
            }
        } else {
            logError('Invalid input.');
            await sleep(1000);
            displayKithRaffleRecap(currentRaffle);
            sizes = await displaySizeChoice(currentRaffle.sizes);
        }
    }
    var registerData = await csvRaffleKith();

    var proxyData = await csvReadProxy2();
    await startTask(currentRaffle, registerData, proxyData, sizes);
}
async function startTask(raffle, registerData, proxyData, tabRange) {
    displayKithRaffleRecap(raffle);

    for (let i = 0; i < registerData.length; i++) {
        let user = registerData[i];
        user.Id = i + 1;
        user.size = tabRange[Math.floor(Math.random() * tabRange.length)]
        logInfo(`[${user.Id}][${user.Email}] - Entry start.`, true);

        var proxyConfig = getAnotherProxy(proxyData);
        console.log("f")
        let resultSsid = await getSessionId(proxyConfig, user);
        console.log("f")

        var sessionId = await handleSessionIdResult(resultSsid, proxyData, user);
        if (sessionId === undefined) continue;
        console.log("f")

        let resultInfo = await getInformation(proxyConfig, user, sessionId);
        resultInfo = await handleInformationResult(resultInfo, proxyData, user, sessionId);
        if (resultInfo === 'ERROR') continue;

        console.log("f")

        var resSID = await getSIDandgessionid(proxyConfig, user);
        while (resSID === 'ERROR') {
            proxyConfig = getAnotherProxy(proxyData);
            resSID = await getSIDandgessionid(proxyConfig, user);
        }
        user.ip = await getIP(proxyConfig);
        while (user.ip === 'ERROR') {
            proxyConfig = getAnotherProxy(proxyData);
            user.ip = await getIP(proxyConfig);
        }

        var res2 = await kithEntry2(proxyConfig, user);
        while (res2 === 'ERROR') {
            proxyConfig = getAnotherProxy(proxyData);
            res2 = await kithEntry2(proxyConfig, user);
        }
        logInfo(`[${user.Id}][${user.Email}] - HCAPTCHA triggered.`, true);
        await solvedHcaptcha('5d390af4-7556-44d7-b77d-2a4ade3ee3b2', 'eu.kith.com', onCaptchaSolved);
        async function onCaptchaSolved(solvedCaptcha) {
            user.captcha = solvedCaptcha
        }
        var res3 = await kithEntry3(proxyConfig, user, raffle);
        while (res3 === 'ERROR') {
            proxyConfig = getAnotherProxy(proxyData);
            res3 = await kithEntry3(proxyConfig, user, raffle);
        }
        if (res3 === 'ENTRY_FAILED') {
            logError(`[${user.Id}][${user.Email}] - Entry failed.`, true);
            continue;
        }
        logError(`[${user.Id}][${user.Email}] - Entry succedded.`, true);

        var res4 = await kithEntry4(proxyConfig, user, raffle);
        while (res4 === 'ERROR') {
            proxyConfig = getAnotherProxy(proxyData);
            res4 = await kithEntry4(proxyConfig, user, raffle);
        }
    }
    logInfo('Task ended.', true);
    await pressToQuit();
}

async function handleSessionIdResult(result, proxyData, user) {
    switch (result.code) {
        case 'PROXY':
        case 'CHALLENGE':
            logError(`[${user.Id}][${user.Email}] - [${result.code}] : Rotating proxy.`, true)
            var proxyConfig = getAnotherProxy(proxyData);
            let newResult = await getSessionId(proxyConfig, user);
            return await handleSessionIdResult(newResult, proxyData, user);
        case 'SUCCESS':
            logSuccess(`[${user.Id}][${user.Email}] - Login success.`, true)
            return result.data;
        case 'UNKNOW_ACCOUNT':
            logError(`[${user.Id}][${user.Email}] - Unknow account (pswd+login doesn't match).`, true)
            return;
        default:
            break;
    }
}
async function handleInformationResult(result, proxyData, user, sessionId) {
    switch (result.code) {
        case 'PROXY':
            logError(`[${user.Id}][${user.Email}] - Rotating proxy.`, true)
            var proxyConfig = getAnotherProxy(proxyData);
            let newResult = await getInformation(proxyConfig, user, sessionId);
            return await handleInformationResult(newResult, proxyData, user, sessionId);
        case 'SUCCESS':
            logSuccess(`[${user.Id}][${user.Email}] - Information collected.`, true)
            return 'SUCCESS';
        case 'ADDRESS_MISSING':
            logError(`[${user.Id}][${user.Email}] - Adresse missing for this account.`, true)
            return 'ERROR';
        default:
            break;
    }
}

function getAnotherProxy(proxyData) {
    if (proxyData.length === 0) {
        logError('A process required a proxy but there is no more available.', true);
        throw 'No more proxyData.';
    }
    const proxy = proxyData.shift();
    return {
        host: proxy.ip,
        port: proxy.port,
        auth: {
            username: proxy.user,
            password: proxy.password
        }
    }
}
// raffleKith()
module.exports = {
    raffleKith
}