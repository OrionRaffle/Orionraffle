const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const Captcha = require("2captcha")
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const request = require('request-promise').defaults({
    jar: true
});
var randomstring = require("randomstring");


process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const proxyCharles = 'http://127.0.0.1:8888'


function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


async function captcha() {


    // A new 'solver' instance with our API key
    const solver = new Captcha.Solver("18fd783e9ec10c948ecc7b259c5fc92e")

    /* Example ReCaptcha Website */
    solver.recaptcha("6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF", "https://eu.kith.com/")

        .then((res) => {

            r = res.data
        }
        )
    await sleep(90000)
    return r
}

const kithEntry1 = async () => {

    proxyconfig = {
        host: '127.0.0.1',
        port: '8888',
    }
    try {
        const resp = await axios({

            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
                'referer': 'https://eu.kith.com/pages/kith-drawing-3-4?t=' + Date.now()

            },
            proxy: proxyconfig,
            withCredentials: true,
            method: 'POST',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&VER=8&RID=${getRandomIntInclusive(1000, 99999)}&CVER=22&X-HTTP-Session-Id=gsessionid&%24httpHeaders=X-Goog-Api-Client%3Agl-js%2F%20fire%2F7.23.0%0D%0AContent-Type%3Atext%2Fplain%0D%0A&zx=${randomstring.generate(11).toLowerCase()}&t=1`,
            data: qs.stringify({
                'count': '1',
                'ofs': '0',
                'req0___data__': '{"database": "projects/launches-by-seed/databases/(default)" }'
            })
        })



        
        return resp
    } catch (err) {


        return 0

    }

}

const kithEntry2 = async (sid, gsession) => {

    proxyconfig = {
        host: '127.0.0.1',
        port: '8888',
    }
    try {
        const resp =  await axios({

            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-FR,fr;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                
                'origin': 'https://eu.kith.com',
                'referer': 'https://eu.kith.com/pages/kith-drawing-3-4?t=' + Date.now()

            },
            proxy: proxyconfig,
            withCredentials: true,
            timeout:800,
            method: 'GET',
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&gsessionid=${gsession}&VER=8&RID=rpc&SID=${sid}&CI=0&AID=0&TYPE=xmlhttp&zx=${randomstring.generate(11).toLowerCase()}&t=1`,
        })
        await sleep(2000)
      console.log(resp)
        return resp.data
    } catch (err) {
        await sleep(2000)
        
        console.log(err.response)
     
        return err.response.data

    }

}


const kithEntry3 = async (sid, gsession) => {

    proxyconfig = {
        host: '127.0.0.1',
        port: '8888',
    }
    try {
        const resp = await axios({

            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "*/*",
                "Accept-Language": "fr-FR,fr;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'origin': 'https://eu.kith.com',
                'referer': 'https://eu.kith.com/pages/kith-drawing-3-4?t=' + Date.now()

            },
            proxy: proxyconfig,
            withCredentials: true,
            method: 'GET',
            
            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&gsessionid=${gsession}&VER=8&RID=rpc&SID=${sid}&CI=0&AID=0&TYPE=xmlhttp&zx=${randomstring.generate(11).toLowerCase()}&t=1`,
        })


        return resp
    } catch (err) {


        return 0

    }

}

function sleep(ms) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
  }
async function kithraffle() {


    dataKith1 = await kithEntry1()

    sid = dataKith1.data.split('","')[1].split('"')[0]
    gsession = dataKith1.headers['x-http-session-id']
    console.log(sid)
    console.log(gsession)
    dataKith2 = await kithEntry2(sid, gsession)
    // dataKith2 = await kithEntry2(sid, gsession)
    console.log(dataKith2)
 
   
    // dataKith2 = await kithEntry2(sid, gsession)

}



module.exports = {
    kithraffle
}

