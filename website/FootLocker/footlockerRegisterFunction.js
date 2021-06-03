const axios = require('axios-https-proxy-fix');
const { magentaBright } = require('chalk');
const colors = require("colors")
const qs = require('qs');
const uuid = require('uuid')
var randomstring = require("randomstring");
var faker = require('faker');


uuidFTL = uuid.v4()

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}


const session = async (proxyconfig,countryName) => {

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
      url: 'https://www.footlocker.' + countryName + '/apigate/session',

    })
    return resp
  } catch (err) {
    // console.log(err)

    return 0

  }

}



const signup = async (token, sessionid,uuidFTL, proxyconfig,countryName) => {

  function between(min, max) {
    return Math.floor(
      Math.random() * (max - min) + min
    )
  }
  const day = between(1, 9)
  const month = between(1, 9)
  const year = between(1975, 1990)
  // proxyconfig = {
  //   host: '127.0.0.1',
  //   port: '8888',
  // }

  const n = between(1111,9999)
  const mail = faker.name.firstName() + faker.name.lastName() + n
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
        'x-api-country': 'FR',
        'x-api-lang': 'it-IT',
        'x-api-key': 'TihHCD65u7NGANG7q7YTyI3GBGAWzOfG',
        'x-fl-device-id': uuidFTL,
        'Cookie': sessionid,
        'x-flapi-session-id': sessionid.split('=')[1],
        'x-flapi-api-identifier': '921B2b33cAfba5WWcb0bc32d5ix89c6b0f614'


      },
      proxy: proxyconfig,
      method: 'POST',
      url: 'https://www.footlocker.' + countryName + '/apigate/users',
      data: {
        'birthday': `0${day}\/0${month}\/${year}`,
        'preferredLanguage': "fr",
        'uid': mail + "@gmail.com",
        'firstName': faker.name.firstName(),
        'lastName': faker.name.lastName(),
        'password': "jffjfb!^^}$hH8",
      }
    })

    return 1
  } catch (err) {
  // console.log(err)
    return 0
  }

}

async function registerFTL(proxy,i) {
  country = ["fr","nl","es","de","be","it","co.uk"]
  countryName = country[Math.floor(Math.random() * country.length)];
  countryName = "es"
  if(proxy != 0){
    proxyconfig = {
        host: proxy.ip,
        port: proxy.port,
        auth: {
          username: proxy.user,
          password: proxy.password
        }
      }
    }else{
       proxyconfig = null
    }

  uuidFTL = uuid.v4()
  

  resp = await session(proxyconfig,countryName)
  if(resp == 0){
    // console.log(`[${i}] Create session ERROR`)
    return
  }
  // console.log(`[${i}] Create session SUCCESS`)
  
  idSession = resp.headers['set-cookie'][0].split(';')[0]
  await sleep(100)
  token = resp.data.data.csrfToken
  resp2 = await signup(token,idSession,uuidFTL,proxyconfig,countryName)
  if(resp2 == 0){
    // console.log(`[${i}] Create account ERROR`)
    
  }else{
  console.log(`[${i}] Create account success`)
  }
}


module.exports = {
  registerFTL
}



