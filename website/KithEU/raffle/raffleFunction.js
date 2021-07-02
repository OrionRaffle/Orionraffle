const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const request = require('request-promise').defaults({
    jar: true
});
var HttpsProxyAgent = require('https-proxy-agent');
var randomstring = require("randomstring");
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// axios.defaults.timeout = 1000
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const proxyConfig = {
    host: '127.0.0.1',
    port: '8888',
}
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}


// Obligatoire pour la sélection de raffle cf. getAllRaffle
async function getSessionId(proxyConfig, user) {
    proxyConfig = 'http://16206265723739:hUo13ZOuhX74fN1i_country-France_session-162334362740@proxy.frappe-proxies.com:31112'

    try {
        const response = await request({
            proxy: proxyConfig,
            withCredentials: true,
            method: 'POST',
            followAllRedirects: true,
            resolveWithFullResponse: true,
            maxRedirects: 1,
            headers: { //Headers minimum obligatoire
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
            },
            uri: 'https://eu.kith.com/account/login',
            form: qs.stringify({
                'form_type': 'customer_login',
                'utf8': '✓',
                'customer[email]': user.email, //Email
                'customer[password]': user.password, //Password
                'return_url': '/account'
            }),
        })
        //Cette condition permet de vérifier si la redirection va sur /account dans le cas contraire, c'est un problème de login (email or password incorrect)
        if (response.body.includes('"https://eu.kith.com/account"')) {

            let sessionId = response.request.headers['cookie'].split(';')[0].split('=')[1]
            console.log("[✓] Login Success - Récupération sessionId (" + sessionId + ")")
            return sessionId
        } else {
            console.log("Login ERROR")
            return 1
        }
    } catch (err) {
        console.log("Proxy")

        process.exit(1)
    }
}

async function getRaffleName(proxyConfig) {
    var raffleTab = []

    try {
        const response = await axios({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
            },
            proxy: proxyConfig,
            withCredentials: true,
            method: 'GET',
            url: `https://eu.kith.com/pages/drawings-list`,
        })
        body = response.data

        num = body

        //Récupération du title et de lien
        for (let i = 0; i < num.split('"drawings__drawing"').length - 1; i++) {
            let raffle = {}
            str = body.split('"drawings__drawing"')[i + 1].split('<a href="')[1]
            raffle.link = str.split('"')[0]

            raffle.title = str.split('drawings__title">')[1].split('<')[0]
            raffleTab.push(raffle)

        }

        return raffleTab
    } catch (err) {
        console.log(err)
    }
}
//Récupération de l'id de chaque raffle
async function getCampaignId(proxyConfig, raffle, sessionId) {
    var raffleTab = []

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
            proxy: proxyConfig,
            withCredentials: true,
            method: 'GET',
            url: raffle.link,
        })


        raffle.campaignId = response.data.split("'campaignId': '")[1].split("'")[0]

    } catch (err) {
        console.log(err)
    }
}

//Récupération du SID et du gessionid pour récuperer les données via FireBASE
const getSessionFireBase = async (proxyConfig, raffle) => {
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
            proxy: proxyConfig,
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

        // console.log(raffle)
        dataLogin.SID = response.data.split('","')[1]
        dataLogin.gsessionid = response.headers['x-http-session-id']

        raffle.dataLogin = dataLogin


    } catch (err) {


        console.log(err)
        return 0

    }
}



const fetch = require('node-fetch');
// const AbortController = require('node-abort-controller');
// const controller = new AbortController()
// const signal = controller.signal

const getRaffleInfo = async (proxyConfig, raffle) => {

    var myInit = {
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
        agent: new HttpsProxyAgent('http://127.0.0.1:8888/')
    };
    let step = 0
    var chunkedUrl = `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&gsessionid=${raffle.dataLogin.gsessionid}&VER=8&RID=rpc&SID=${raffle.dataLogin.SID}&CI=0&AID=0&TYPE=xmlhttp&zx=${randomstring.generate(11).toLowerCase()}&t=1`;
    let a = ''
    const promise = new Promise(async function (resolve) {
        await fetch(chunkedUrl, myInit).then(response => response.body)
            .then(res => res.on('readable', () => {
                // data = res.read().toString()
                data = res.read()
                if (data === null) return;
                a = a + data.toString()

                //    console.log(!already1)
                //    console.log(a.includes('/models') + ' models')
                //    console.log(a.includes('status') + ' status ')
                //    console.log(a.includes("/location")  + " location\n")
                if (a.includes('Pick Up')) {
                    raffle.type = 'Instore'
                } else {
                    raffle.type = 'Online'
                }
                if (a.includes('/models') && a.includes('status') && (step === 0)) {
                    console.log('Step 1 OK')
                    step = 1
                    // console.log(raffle)

                    raffle.status = a.split('"status"')[1].split('"stringValue": "')[1].split('"')[0]
                    raffle.models = a.split('/models/')[1].split('"')[0]
                    getRaffleStatus3(proxyConfig, raffle)
                    getRaffleStatus4(proxyConfig, raffle)



                }

                if (a.includes("/locations/") && ((step === 1)) && raffle.type == 'Online') {


                    // console.log(a)
                    // console.log('------------------')
                    // console.log(a.substr(a.indexOf("/locations/") - 100, a.indexOf("/locations/") + 100))
                    // console.log('------------------')
                    // console.log(a.split('/locations/')[1].split('"')[0])


                    raffle.location = a.split('/locations/')[1].split('"')[0]
                    if (raffle.location.length !== 20) return; //Location incomplete
                    step = 2
                    console.log('Step 2 OK')

                    if (raffle.title.includes('Store Pick Up')) resolve();//No size

                    getRaffleStatus5(proxyConfig, raffle)
                    getRaffleStatus6(proxyConfig, raffle)
                    getRaffleStatus7(proxyConfig, raffle)
                    getRaffleStatus8(proxyConfig, raffle)
                }

                if (a.includes("/locations/") && ((step === 1)) && raffle.type == 'Instore') {


                    // console.log(a)
                    // console.log('------------------')
                    // console.log(a.substr(a.indexOf("/locations/") - 100, a.indexOf("/locations/") + 100))
                    // console.log('------------------')
                    // console.log(a.split('/locations/')[1].split('"')[0])


                    raffle.location = a.split('/locations/')[1].split('"')[0]
                    if (raffle.location.length !== 20) return; //Location incomplete
                    step = 1


                    getRaffleStatus5(proxyConfig, raffle)
                    getRaffleStatus6(proxyConfig, raffle)



                }
                if (a.includes("/locations/") && ((step === 1)) && raffle.type == 'Instore' && a.includes('Kith Paris')) {


                    // console.log(a)
                    // console.log('------------------')
                    // console.log(a.substr(a.indexOf("/locations/") - 100, a.indexOf("/locations/") + 100))
                    // console.log('------------------')
                    // console.log(a.split('/locations/')[1].split('"')[0])


                    raffle.location = a.split('/locations/')[2].split('"')[0]
                    if (raffle.location.length !== 20) return; //Location incomplete
                    step = 2
                    console.log('Step 2 OK')

                    getRaffleStatus7(proxyConfig, raffle)
                    getRaffleStatus8(proxyConfig, raffle)
                }



                // console.log(a.split('"size"').length)
                // console.log(a.includes('"size"'))
                if (a.includes('"inventory"') && data.toString().includes('targetChange') && (step === 2)) {
                    //console.log(a.substr(a.indexOf(']]]192')-100,a.indexOf(']]]192')+100))
                    let inventory = []
                    let sizes = []
                    inventoryLength = a
                    try {
                        for (let i = 0; i < inventoryLength.split('"size"').length; i++) {
                            strI = a.split('"inventory"')[i + 1].split('stringValue": "')[1].split('"')[0]
                            if (isNaN(strI)) strI = '0';

                            strS = a.split('"size"')[i + 1].split('stringValue": "')[1]


                            sizes.push(strS.split(' U')[0].trim())
                            inventory.push(strI)

                            // raffle.title = str.split('drawings__title">')[1].split('<')[0]
                            //raffleTab.push(raffle)
                        }
                    } catch (e) { /*console.log(e)*/ }
                    raffle.sizes = sizes;
                    if (raffle.type === 'Online') raffle.inventory = inventory
                    resolve()
                }
            }))

    });
    await promise;
    return;
}



const getRaffleStatus = async (proxyConfig, raffle) => {
    let dataLogin = {}
    // console.log(raffle)
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
            proxy: proxyConfig,
            // withCredentials: true,
            method: 'POST',
            // timeout:700,
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
        // console.log(response)
    } catch (err) {
        console.log(err)
        return 0

    }
}
const getRaffleStatus2 = async (proxyConfig, raffle) => {
    let dataLogin = {}
    // console.log(raffle)
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
            proxy: proxyConfig,
            // withCredentials: true,
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
        // console.log(raffle)
    } catch (err) {
        console.log(err)
        return 0

    }
}


const getRaffleStatus3 = async (proxyConfig, raffle) => {
    let dataLogin = {}
    // console.log(raffle)
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
            proxy: proxyConfig,
            // withCredentials: true,
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
        // console.log(raffle)
    } catch (err) {
        console.log(err)
        return 0

    }
}

const getRaffleStatus4 = async (proxyConfig, raffle) => {
    let dataLogin = {}
    // console.log(raffle)
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
            proxy: proxyConfig,
            // withCredentials: true,
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
        // console.log(raffle)
    } catch (err) {
        console.log(err)
        return 0

    }
}

const getRaffleStatus5 = async (proxyConfig, raffle) => {
    let dataLogin = {}
    // console.log(raffle)
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
            proxy: proxyConfig,
            // withCredentials: true,
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
        // console.log(raffle)
    } catch (err) {
        console.log(err)
        return 0

    }
}

const getRaffleStatus6 = async (proxyConfig, raffle) => {
    let dataLogin = {}
    // console.log(raffle)
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
            proxy: proxyConfig,
            // withCredentials: true,
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
        // console.log(raffle)
    } catch (err) {
        console.log(err)
        return 0

    }
}


const getRaffleStatus7 = async (proxyConfig, raffle) => {
    let dataLogin = {}
    // console.log(raffle)
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
            proxy: proxyConfig,
            // withCredentials: true,
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
        // console.log(raffle)
    } catch (err) {
        console.log(err)
        return 0

    }
}

const getRaffleStatus8 = async (proxyConfig, raffle) => {
    let dataLogin = {}
    // console.log(raffle)
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
            proxy: proxyConfig,
            // withCredentials: true,
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
        // console.log(raffle)
    } catch (err) {
        console.log(err)
        return 0

    }
}

//Récupération
async function getAllRaffle(proxyConfig, user) {

    sessionId = await getSessionId(proxyConfig, user)
    if (sessionId == 1) process.exit(1)
    raffleTab = await getRaffleName(proxyConfig)


    for (i in raffleTab) {
        console.log("i : " + i)

        await getCampaignId(proxyConfig, raffleTab[i], sessionId)
        await getSessionFireBase(proxyConfig, raffleTab[i])
        // getRaffleInfo(proxyConfig, raffleTab[i])
        await getRaffleStatus(proxyConfig, raffleTab[i])
        await getRaffleStatus2(proxyConfig, raffleTab[i])
        // await getRaffleStatus3(proxyConfig, raffleTab[i])
        await getRaffleInfo(proxyConfig, raffleTab[i])

        // await sleep(2000)
        // await getRaffleStatus3(proxyConfig, raffleTab[i])

        // setTimeout(function() {

        // await getRaffleInfo(proxyConfig, raffleTab[i])
        // await sleep(1000)
        // }, 1000); // after 3 min
        // await getRaffleStatus4(proxyConfig, raffleTab[i])

        // await getRaffleInfo(proxyConfig, raffleTab[i])
        // await getRaffleInfo(proxyConfig, raffleTab[i])

        // await getRaffleStatus(proxyConfig, raffleTab[i])
        // await getRaffleStatus2(proxyConfig, raffleTab[i])
    }
    // await getSessionFireBase(proxyConfig, dataLogin)
    console.log(raffleTab)
}


//Récupération



//Login Obligatoire
async function getCustomerId(proxyConfig, user) {
    try {
        const response = await request({
            proxy: proxyConfig,
            withCredentials: true,
            method: 'POST',
            followAllRedirects: true,
            resolveWithFullResponse: true,
            maxRedirects: 1,
            headers: { //Headers minimum obligatoire
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Connection': 'keep-alive',
            },
            uri: 'https://eu.kith.com/account/login',
            form: qs.stringify({
                'form_type': 'customer_login',
                'utf8': '✓',
                'customer[email]': user.email, //Email
                'customer[password]': user.password, //Password
                'return_url': '/account'
            }),
        })
        //Cette condition permet de vérifier si la redirection va sur /account dans le cas contraire, c'est un problème de login (email or password incorrect)
        if (response.body.includes('"https://eu.kith.com/account"')) {
            let customerId = response.body.split('customer:')[1].split('|')[0].trim()
            console.log("[✓] Login Success - Récupération customerId (" + customerId + ")")
            return customerId
        } else {
            console.log("Login ERROR")
            process.exit(1)
        }
    } catch (err) {
        console.log(err)
    }
}

const getSIDandgessionid = async (proxyConfig, user) => {

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
            proxy: proxyConfig,
            withCredentials: true,
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'RID': getRandomIntInclusive(1000, 99999),
                'CVER': '22',
                'X-HTTP-Session-Id': 'gsessionid',
                '$httpHeaders': 'X-Goog-Api-Client:gl-js/ fire/7.23.0',
                'Content-Type': 'text/plain',
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

        console.log('Récupération SID (' + user.SID + ')')
        console.log('Récupération gsessionid (' + user.gsessionid + ')')

    } catch (err) {
        console.log(err)
        return 0

    }
}
//Récupération du SID et du gsession, obligatoire pour les prochaes requêtes
const kithEntry2 = async (proxyConfig, user) => {

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
            proxy: proxyConfig,
            withCredentials: true,
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
            params: {
                'database': 'projects/launches-by-seed/databases/(default)',
                'VER': '8',
                'gsessionid': user.gsessionid,
                'SID': user.SID,
                'RID': getRandomIntInclusive(1000, 99999),
                'zx	': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '0',
                'req0___data__':
                {
                    "streamToken": "GRBoQgKB9LW1",
                    "writes": [
                        {
                            "update": {
                                "name": "projects/launches-by-seed/databases/(default)/documents/submissions/yqRL4kPcTLDLKeBPQGSd-5141507702861",
                                "fields": {
                                    "currentDate": {
                                        "stringValue": "2021-05-14T21:57:46+02:00"
                                    },
                                    "campaignId": {
                                        "stringValue": user.campaignId
                                    },
                                    "customerId": {
                                        "stringValue": user.customerId
                                    },
                                    "type": {
                                        "stringValue": ""
                                    },

                                    "size": {
                                        "stringValue": "8 US"
                                    },
                                    "model": {
                                        "stringValue": "s8md8d2lbK4c8F9tzsBe"
                                    },
                                    "modelName": {
                                        "stringValue": "Nike x Ambush Dunk Hi \"Deep Royal\" "
                                    },
                                    "location": {
                                        "stringValue": "r8vaarOGcXtKkUXvcHcC"
                                    },
                                    "locationName": {
                                        "stringValue": "Kith Paris"
                                    },
                                    "email": {
                                        "stringValue": "jade.lambert29@outlook.com"
                                    },
                                    "phone": {
                                        "stringValue": "0643774701"
                                    },
                                    "firstName": {
                                        "stringValue": "Jade"
                                    },
                                    "lastName": {
                                        "stringValue": "Lambert"
                                    },
                                    "zipCode": {
                                        "stringValue": "44300"
                                    },
                                    "customerObject": {
                                        "mapValue": {
                                            "fields": {
                                                "currentDate": {
                                                    "stringValue": "2021-05-14T21:56:00.000-05:00"
                                                },
                                                "campaignId": {
                                                    "stringValue": "yqRL4kPcTLDLKeBPQGSd"
                                                },
                                                "accepts_marketing": {
                                                    "stringValue": "true"
                                                },
                                                "addresses": {
                                                    "arrayValue": {
                                                        "values": [
                                                            {
                                                                "mapValue": {
                                                                    "fields": {
                                                                        "address1": {
                                                                            "stringValue": "31 Avenue Castellano"
                                                                        },
                                                                        "address2": {
                                                                            "stringValue": ""
                                                                        },
                                                                        "city": {
                                                                            "stringValue": "Nantes"
                                                                        },
                                                                        "company": {
                                                                            "stringValue": ""
                                                                        },
                                                                        "country": {
                                                                            "stringValue": "France"
                                                                        },
                                                                        "country_code": {
                                                                            "stringValue": "FR"
                                                                        },
                                                                        "first_name": {
                                                                            "stringValue": "Jade"
                                                                        },
                                                                        "id": {
                                                                            "stringValue": "6338813100109"
                                                                        },
                                                                        "last_name": {
                                                                            "stringValue": "Lambert"
                                                                        },
                                                                        "phone": {
                                                                            "stringValue": "0643774701"
                                                                        },
                                                                        "province": {
                                                                            "stringValue": ""
                                                                        },
                                                                        "province_code": {
                                                                            "stringValue": ""
                                                                        },
                                                                        "street": {
                                                                            "stringValue": "31 Avenue Castellano"
                                                                        },
                                                                        "zip": {
                                                                            "stringValue": "44300"
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                "addresses_count": {
                                                    "stringValue": "1"
                                                },
                                                "email": {
                                                    "stringValue": "jade.lambert29@outlook.com"
                                                },
                                                "first_name": {
                                                    "stringValue": "Jade"
                                                },
                                                "has_account": {
                                                    "stringValue": "true"
                                                },
                                                "id": {
                                                    "stringValue": "5141507702861"
                                                },
                                                "last_name": {
                                                    "stringValue": "Lambert"
                                                },
                                                "last_order": {
                                                    "stringValue": ""
                                                },
                                                "name": {
                                                    "stringValue": "Jade Lambert"
                                                },
                                                "orders_count": {
                                                    "stringValue": "0"
                                                },
                                                "phone": {
                                                    "stringValue": "0643774701"
                                                },
                                                "tags": {
                                                    "stringValue": ""
                                                },
                                                "tax_exempt": {
                                                    "stringValue": "false"
                                                },
                                                "total_spent": {
                                                    "stringValue": "0"
                                                },
                                                "country": {
                                                    "stringValue": "France"
                                                },
                                                "country_code": {
                                                    "stringValue": "FR"
                                                },
                                                "ip": {
                                                    "stringValue": "86.236.253.237"
                                                }
                                            }
                                        }
                                    },
                                    "ip": {
                                        "stringValue": "86.236.253.237"
                                    },
                                    "processed": {
                                        "booleanValue": false
                                    },
                                    "mouseMoved": {
                                        "booleanValue": true
                                    },
                                    "customerMessage": {
                                        "stringValue": ""
                                    },
                                    "country": {
                                        "stringValue": "France"
                                    },
                                    "countryCode": {
                                        "stringValue": "FR"
                                    },
                                    "site": {
                                        "stringValue": "kith-europe.myshopify.com"
                                    },
                                    "risk": {
                                        "stringValue": "null"
                                    },
                                    "captchaToken": {
                                        "stringValue": "P0_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNza2V5IjoiSnFqRXlyWFdsOGtyWXJwam9BK0hiMHlKVUV2WG5HOGpaNWxXUExoUkVic2hHWVhwRTJYRW1Cd3dZOWxrK1ZSZC9iRVF6cDVsUnpWOUVFeUFPQWhIYVZENWhtZVR1aDNBQ2VTM05vUytGZ2k4c1FjSE9reDkrSkU0SUE2ZHp5NkI0bTA4MG1qMnFJak1mcjNVZnZ6dHpCdXlzRmVrVFh5N3FPS0dQcGduakNETTZwZHdDOU5IUjR1SXQwN2c0cU85a0RJbFFCRmk5TitXeDJzT2R5OGNKZWF1T0ZjanlTamhGd2ttUnk3eEk3UllRYU4rS3lYTURYYXlhVEpxcWsxRHhoN1FYbkdHSHhKc0paNFNPb0l2THF6RFN1QWtmcTZqcWNVeUQ1OVhBSUZvQ242ZUUzTFc4cy9YanNUa1h0ekloQnNKZEpHa0UvTGRZRHRFWEpxMVViVlNjcXFXNmUzT3NXcmJMZWdRTG8zd3FHMGdpeFAwektWZytGc2k2SmR5d3c5dmMzZUhkaGJiZEFnZXpWK3VOWXVta3lhV0VJTXpWdThnNnJaMDZiNmpYcTVNMEhXaDNTQ3Y0MGNnWDU1MG94TWpzR1ZQSjZuOHhjUXFZV0svcld6VlFSendtNlBaVkcvRmxyOHVJOHpIL1FhMzZmejJzRmVSYWE3OFRXcmowViszVlQ0OWgwaTU3eGNuYVpvOXU4VTJxWGppK3RnY1JxZEduN2g5UWZ2dDJGaE9BU0JpUHlKOG1OMkNKb0hXYms5RDBMOExTV0N2R1JsTWNGc3d0bmRsdG5rZ0lxMFpTN2NvcTN0bmg4WCtmRXdUMGNtbGVBTTJZdmJrMFBFL2RqOTJWYk1sQURIUWlEUTJmVWcydERKREZucVpheW1VbVRTRDF4OENUbnpjWlkyYTJ2UHhVTzhpRUpUT3VkNFhvbWdDS2tSdzFxZTNmUEhmcWd2WUkvMjZucFk4cGZadFhyc3pTVzRXUmI5RjFqdlNpQUpvekVkQmtqaFFvd01ONWFmZHpacUhOTmhheDEzTUlBWDJFUlA2SGtmS0cwNGxTcHk5eGVOOVFMejNVMU9vR2RGQU9CeldmSC9wQ1c1SkJENkI0VjBRR09zanFLcFFQekNTRHFLUGcrWFEvMGpTa3ZseWdOY0J3YVpEc00vRXcxV2VrTEcyOElqSFpvU1BpKy8vZktwcmZaV3FacXQyTW1kNHhmOE9MajZjVkdkV3hacXV0Ni83ckVYSjFXYWFEd1ZNalZoMk1iOTlOeDRlOThYNVFmQmp0eS9XdHVuTll2ZS9xc1VUV0xkaFFRQVM0S0dZWnRCRGNjMEt1QWFwUlU0MDFUNVNJWE1FL1R5djhTem1tREFOdWpyVWxkQXVoKzBFWjh6VEdBZEpuOTVraGNCSmFYeXcwUHd4SXN2MmFscUQ1SWFBak9KTHcrZGpmR0d5SUFCTUFwSnRITHVoUDk1NGN5Z2FKazRhbkFXbHdDNmxHMlZBZTUyZ0xERkpPaGxzUGpPTUluVkdFb04wZUpCM0NhN29oLzdzR2ZhQUdlWDJvN3RzVFJ1eDFybm0xR3lUV2xnVWFzMEFnNWhzV2lNcHNGbEM2N2pRYXhoU205RkpLU0Y0VEh0S3VMVG0yODBBTUZWNFRyNThjcWhwR09LUXdyLzlIU0pVZENFbGU4MytQSlZhOVZwWVBiWlZuQittekhPTjBxM3crNmRVYi9CUG5RZDJpR3BHaklQbEh4YTVXZjlNVmVtdVh0cklBd3pCb21Ib1ZYcy9JZXk4RXN2a3lIM2xtTkR5REFsY3VsMERrdk9mait4NUh2cEhoQUFBZTFWaFZkN0JFckR2Uy93aUN3NEhLYjhWTWhQQnQ2QjJjd2tXS1B4OG1FYkk0Z2NENGJ3ZC8vcEs1SDNSZjFYVGkvUDlrcVVvb3pPYndCU1RQVUVxdDF5MEI0NFhIUzdLUDlENUFydnppOE5oTDE4aVlTaDVOeDJsVDJkK1F4RUN1NTFvdWdCaTRaTHJYVlJmeGI3MHc0cHRndzNBZ25iUGtJOCt6UnBrTkUwRlFpY1IvT3RYZGIwSk1xTFp5QkUybEtod3lEQ2FBd0dvelJyNGNBclZsVzRUd3BJb04xaXBGbG9sTjA3d3BJejB3N1B5Z3FzektMSk9zUnUwUXVFTjRnYVVXRlRaR0tjU0lGMGRkd05JWThNUElLeDdyRFJWSGZsVVVYVm9BZzduemZtSllYdDlmTWpYZ0swMTJiUFpxalo2RFRLSE14UnJ2Zm5TdDQ2NHFHWjZMYVNhclNzTW93UXhmaWdwOUhzYVIwbjRydkhiRWpacnZHeVkrZ0R6aURSZGs0MmZXNVEySDYwd1AzNEtGbTBla1h2NTZzeUFwRU1JaW8vb1V2Y2FEWUdpcGdpME1WSk1XeWxhZjlYQmtpYXNuRmZjTzhyZEY2OXNLNzZJQ0VvTmtqaGlkMWxvUVB1aFhicG14M25rWVVwY3RjRldiSldWNXdBRnJ3NWxyL3FjbHJKZ25ablhoelhZaUFlZnJ0UkV2ckdmWGE2K1NraGNFbE1wWjdZSlQ5MVA4SUlFTW9zUnNlYzNyblh4OEd0YXpOOEltYWNpVzdXbUc4S1RSbE5oTTNuY2s5VFdHRXZ1eUtGeCtPdHJUU1hURVZOa0Y5ekxQbDdXQ01CdHQwNVJHMzhpVlc2SzVaUDZlOXZvQXc5c3JCZXdTakhvWXg1RzhZeTdpNHVGSlYxRUhOSU9Ed254VUg2dG50QnV3OGt2eDhCekROMnoyVEwwUXZjekd5U0pRMUlWRWVVZDg4aWFremFFaG1BaFpObFZFWFRaR25PUFhlckpZNEhUSEJFaU4wNkljbkdLQTVNd0JNME1pVnp2enBHMkdUNEYvaHh2RWFIZVY0WVdPMEFhQnZLWExCZmRUSEE5QjZjTWdSSXAxWWVTQW5FN3RqeWhhQTBkb1BSNTdFK0VnOTRnditpd1lacVl4enJDWjRCckJxdFVveUhjV0NmKytHOXlSSTZqV1pwcTJIbWoreThUSVJtbTdhdnZvWWhFZCtteSt6UWt6WHp4VnFPTHVacnM1SEZ5YkMvbXJkSlc3Y2ZqVktlY1NkWEhTTzRvVTlTMXpSem5yK21BeHJjaEx3ZkNVV0QvemJxU2Z3YXAwMlZsaTlPSmxZVWZDS2xyS0dvWk45d0h2NmFuNFIvL0RSSk8xd0FES2thZWlIUHNaQ3hCNTJLR21TOG9adWYvTEZuSFVkRWJqTytIckYzTmZsOFljZWdsRDV2em9IQ3BKV2hJc0pwa2R6Z2V3bTVZbDErUEpTWGpaVVN6VE9VODlxOTlVNk9QM1drQ3BIRHZoejFhMkZwMlM2QUpKNHJIcU5BbXRlMzlTMll0YnhqU0R6WXJNSWZmdUlNaUxTcUx4bURBVk1RK0RnbFJFODJhQnpnUXVsRFJCWThiWldyUVR6K3JPemY5Z2Q3bE5VMjQydUViNVhmU2Q4TTBXR0ZicWF5eFIxbmZTSXFsdy9ta3VSbFk4S0t6TzIybTU3ZThSYkdQVUFtK0lIUXJQQTBpNktJUk1MVThjUEJxNEF0blhzQy9HTGI2WUgzQWc3eG5wTzJ2ZUQ3VVNTSktLNGRIQ1J4VHA0aGpraHJFUHo4TWxiTW4rY0lmRmx5azhZWDRBbS9SM29HREQyMUM0SmhPOGtNelJhd2l4dEE0c1h3bDlNaFZJcFQ2OVhWT3IvWGNzVThSekFFRS94ckdMTkdmSWRNSHVnNUFwY1NnSnNkQWR0bDZNSjhieEtYTFQxT2hGQjlhOHFRT3RydGxKN2ZYMU9FMjNPV3FzOG5MbEt0Wjd2M214VUlGYkw5NDE4bEtxVzdxRjlUeHZiK0JoeWR0UEpQM3JxZzZLZExXOFF6VGh1Umszelc1bzJwWXJNQUk5UFhiOVp1bW9INWxXdFQ0ME92ZWNrOXVDdWwwalJBa0ptKzk5ZmhpV2tDU3ppNDQzNXY1aXEzRnpJcHBXYVlTRktXZWt1MGVKRVJqWlpwVEtWemU5QTBZSjl0d1FIem42NnNXMWRLVXlobU5CRVBnZUNweEJ5YzVzRnBRNk1ucVlDaDJXemxvSGk4aElFVFMweHVnOWVPMkY4YXN0SUtLdHZEcDhmMmRiNmMzTU56eVZ6eEdmY1JadDIrdlhaaEVGSEluYm1zTlZkTFVCOGZORHlDcEVzR1c2QjFWcXBGSmk4Uy9Db1drR3FGMVBBZTV3b1RoSE0yVWRsQVdRVWRQTFl0dlk2cHRVV3pNZWFub01qYm9Gd1hzalFjdGZHWXEzMXN0OXQ5MFU5cDZqVnhwRmNXMTBxKzUxdndDalRodG9xMnJuZkdWaWh2N1B2bmhuL0k1ZWZFWU1LdHVBcnRwMGNKc2R3Tkt2dUZXRHRBZFhSYjFGT00wSjkxTENsU092SWUzc0c0b0xxZE1paW4yWUxnMFpnMU91MERla3hzRVRKZnlWcWhJMGlab21XdE5td1RHaXB2YXNROGdjMSt6WkVDcVk0UVMzUWY0WW1vaGV4SWtWRHpseHVjbElOa1pwR2RBbWNRb0xQM3VlYzdYWEJscmtUVFQ2ZVdNeXZtdzh0cUpnWVgyZDcwUHRkMmltY1pPQlJ1cnhmREZOa0F4YnFtTy9qZ1JwazJGR00yNkt0YWxraDNCTEl4TUhReXIvZkZmb1ZXOEplQ25GT21mWWQzV3lUTWVMekdGeGY3M3FjNXlTMGpGUTM4NGJPbGVzL21RNnVoTWxlZ094dXJVcVVUOGR6TjZONk53eERQeDJJSEFoOXphYUwxWUpHMHhZUXI0aDhhL1JRbkNtV044TWtiZHh5ZHRpbDhRK3J3dyIsImV4cCI6MTYyMTAyMjM4Miwic2hhcmRfaWQiOjgyMDc4NjA4NiwicGQiOjB9.EZsbOQewwcK3510wBxqpDKOW-rq-cS3_RoQh1habTww"
                                    },
                                    "synced": {
                                        "booleanValue": false
                                    },
                                    "isSyncing": {
                                        "booleanValue": false
                                    },
                                    "ccZip": {
                                        "stringValue": "not-set"
                                    },
                                    "ccBrand": {
                                        "stringValue": "not-set"
                                    },
                                    "ccCountry": {
                                        "stringValue": "not-set"
                                    },
                                    "ccLast4": {
                                        "stringValue": "not-set"
                                    },
                                    "groupId": {
                                        "integerValue": "57"
                                    }
                                }
                            }
                        }
                    ]
                }
            })
        })


        user.SID = response.data.split('","')[1].split('"')[0]
        user.gsessionid = response.headers['x-http-session-id']

        console.log('Récupération SID (' + user.SID + ')')
        console.log('Récupération gsessionid (' + user.gsessionid + ')')

    } catch (err) {
        console.log(err)
        return 0

    }
}

async function raffleKith() {
    //    var proxy1 = await getRandomProxy()
    //     proxyConfig = {
    //       host: proxy1.ip,
    //       port: proxy1.port,
    //       auth: {
    //         username: proxy1.user,
    //         password: proxy1.password
    //       }
    //     };

    let user = {
        'email': 'clementTest@gmail.com',
        'password': 'POKEMON1'
    }
    var proxyConfig = {
        host: '127.0.0.1',
        port: '8888',
    }


    await getAllRaffle(proxyConfig, user)
    // console.log('LOGIN')
    // customerId = await getCustomerId(proxyConfig, user)
    // console.log('------------------------------')
    // console.log('\nENTRY')
    // console.log('\nFunction 1')

    // await kithEntry1(proxyConfig, user)


}

module.exports = {
    raffleKith
}