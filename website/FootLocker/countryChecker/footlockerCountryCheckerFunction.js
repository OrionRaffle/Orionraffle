const axios = require('axios-https-proxy-fix');
const { magentaBright } = require('chalk');
const colors = require("colors")
const qs = require('qs');
const uuid = require('uuid')
var randomstring = require("randomstring");

uuidFTL = uuid.v4()

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}


const session = async (proxyconfig) => {

  // proxyconfig = {
  //   host: '127.0.0.1',
  //   port: '8888',
  // }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        "Accept": "application/json",
        "Accept-Language": "fr-FR,fr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',


      },
      proxy: proxyconfig,
      method: 'GET',
      url: 'https://www.footlocker.de/apigate/session',

    })
    return resp
  } catch (err) {
    console.log(err)

  }

}


const account = async (token, cookie) => {
  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'FLEU/CFNetwork/Darwin',
        "Accept": "application/json",
        "Accept-Language": "fr-FR,fr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-flapi-resource-identifier': token,
        'Cookie': cookie,
        'x-flapi-session-id': cookie.split('=')[1],
        'x-flapi-api-identifier': '921B2b33cAfba5WWcb0bc32d5ix89c6b0f614' ?
          'x-api-country' : 'FR',
        'x-api-lang': 'fr-FR'


      },
      proxy: proxyconfig,
      method: 'GET',
      url: 'https://www.footlocker.fr/apigate/users/account-info',




    })
    console.log(resp)
  } catch (err) {
    console.log(err)

  }

}

const signup = async (token, sessionid, proxyconfig) => {
  fingerprint = randomstring.generate({
    length: 10,
  });
  // proxyconfig = {
  //   host: '127.0.0.1',
  //   port: '8888',
  // }

  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        "Accept": "application/json",
        "Accept-Language": "fr-FR,fr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'Content-Type': 'application/json',
        'x-csrf-token': token,
        'x-api-country': 'DE',
        'x-api-lang': 'it-IT',
        'x-api-key': 'TihHCD65u7NGANG7q7YTyI3GBGAWzOfG',
        'x-fl-device-id': uuidFTL,
        'Cookie': sessionid,
        'x-flapi-session-id': sessionid.split('=')[1],
        'x-flapi-api-identifier': '921B2b33cAfba5WWcb0bc32d5ix89c6b0f614'


      },
      proxy: proxyconfig,
      method: 'POST',
      url: 'https://www.footlocker.de/apigate/users',
      data: {
        'birthday': "05\/04\/1995",
        'preferredLanguage': "fr",
        'uid': fingerprint + "@nightlyb.club",
        'firstName': "Jehcfrbb",
        'lastName': "Dbdcbdb",
        'password': "jffjfb!^^}$hH8",
      }
    })

    console.log(resp.data)
  } catch (err) {
    console.log(err)
    console.log(err.response.data)
  }

}

async function countryChecker(proxy) {
  resp = await session(proxy)
  console.log(resp)
  idSession = resp.headers['set-cookie'][0].split(';')[0]
  token = resp.data.data.csrfToken
  success = await signup(token, idSession)

}


module.exports = {
  countryChecker
}



