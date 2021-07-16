const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const request = require('request-promise').defaults({
  jar: true
});
var HttpsProxyAgent = require('https-proxy-agent');
var randomstring = require("randomstring");
const fetch = require('node-fetch');
const { sleep } = require('../../../utils/utils');
var moment = require('moment');
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { solvedHcaptcha } = require('../../../utils/2captcha');


const inputReader = require('wait-console-input')

const clear = require('console-clear')
const setTitle = require('node-bash-title')
const chalk = require('chalk')
const figlet = require('figlet')
const colors = require('colors')
const lineReader = require('line-reader')

const { csvRaffleXhibition } = require('../../../utils/csvReader');

const {
  csvproxyreader,
  csvconfigreader,
} = require('../../../init')

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getSessionId(proxyConfig, user) {
  proxyconfig = {
    host: proxy.ip,
    port: proxy.port,
    auth: {
      username: proxy.user,
      password: proxy.password
    }
  }
  try {
    const response = await request({
      proxy: proxyConfig,
      withCredentials: true,
      method: 'POST',
      followAllRedirects: true,
      resolveWithFullResponse: true,

      headers: { //Headers minimum obligatoire
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'keep-alive',
      },
      uri: 'https://www.xhibition.co/account/login',
      form: qs.stringify({
        'form_type': 'customer_login',
        'utf8': '✓',
        'customer[email]': user.Email, //Email
        'customer[password]': user.Password, //Password

      }),
    })
  } catch (err) {
    //Cette condition permet de vérifier si la redirection va sur /account dans le cas contraire, c'est un problème de login (email or password incorrect)
    if (await handleProxyError(err) !== null) {
      return 2
    }

    if (err.response.data.includes('"https://www.xhibition.co/account"')) {

      let sessionId = err.response.request.res.headers['set-cookie'][0].split(';')[0].split('=')[1];
      return sessionId;
    }

    if (err.response.data.includes('"https://www.xhibition.co/account/login?return_url=%2Faccount"')) {
      console.log('Compte existe pas')
      return 1;
    }

    if (err.response.data.includes('"https://wwww.xhibition.co/challenge"')) {
      console.log('Challenge, proxy rotating')
      return 2;
    }

    return 2
  }
}


async function getInformation(proxyConfig, user, sessionId) {
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
      url: 'https://www.xhibition.co/account/addresses',
    })
    user.CustomerId = response.data.split('"customerId":')[1].split('}')[0]

    nbClose = response.data.split('<p><strong>Default</strong></p>').length
    if (nbClose != 0) {

      data = response.data.split('<p><strong>Default</strong></p>')[1]

      user.FirstName = data.split('address[first_name]')[1].split('value="')[1].split('"')[0]
      user.LastName = data.split('address[last_name]')[1].split('value="')[1].split('"')[0]
      user.Address = data.split('address[address1]')[1].split('value="')[1].split('"')[0]
      user.Country = data.split('address[country]')[1].split('data-default="')[1].split('"')[0]
      if (user.Country != 'United States') {
        console.log('US Account only')
        return
      }
      user.City = data.split('address[city]')[1].split('value="')[1].split('"')[0]
      user.IdProvince = data.split(`<br>${user.City} `)[1].split(' ')[0]
      user.Province = data.split('address[province]')[1].split('data-default="')[1].split('"')[0]
      user.PostalCode = data.split('address[zip]')[1].split('value="')[1].split('"')[0]
      user.Phone = data.split('address[phone]')[1].split('value="')[1].split('"')[0]
      user.IdAddress = data.split('data-form-id="')[1].split('"')[0]
      user.Address_Count = String(data.split('address[first_name]').length - 1)

    } else {
      console.log('No Address')
      return 1
    }
  } catch (err) {


    if (await handleProxyError(err) !== null) {
      return 2
    }
    console.log(err)

  }
}

const xhibitionEntry1 = async (proxyConfig, user) => {

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


  } catch (err) {
    if (await handleProxyError(err) !== null) {
      return 2
    }
    console.log(err)
    return 0

  }
}
const xhibitionEntry2 = async (proxyConfig, user) => {
  proxyconfig = {
    host: proxy.ip,
    port: proxy.port,
    auth: {
      username: proxy.user,
      password: proxy.password
    }
  }
  try {
    const response = await axios({
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        "Accept": "*/*",
        "Accept-Language": "fr-fr",
        "Accept-Encoding": "gzip, deflate, br",
        'Content-Type': 'application/x-www-form-urlencoded',

      },
      proxy: proxyConfig,
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
      return 2
    }
    
  }
}
const xhibitionEntry3 = async (proxyConfig, user, raffle) => {

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
        'AID': '1',
        'zx	': randomstring.generate(11).toLowerCase(),
        't': '1',
      },
      data: qs.stringify({
        'count': '1',
        'ofs': '0',
        'req0___data__': `{"streamToken":"GRBoQgKB9LW1","writes":[{"update":{"name":"projects/launches-by-seed/databases/(default)/documents/submissions/${raffle.campaignId}-${user.CustomerId}","fields":{"currentDate":{"stringValue":"${m.format()}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"customerId":{"stringValue":"${user.CustomerId}"},"type":{"stringValue":""},"size":{"stringValue":"${user.size} US"},"model":{"stringValue":"${raffle.models}"},"modelName":{"stringValue":"${raffle.modelName}"},"location":{"stringValue":"${raffle.location}"},"locationName":{"stringValue":"${raffle.locationName}"},"email":{"stringValue":"${user.Email}"},"phone":{"stringValue":"${user.Phone}"},"firstName":{"stringValue":"${user.FirstName}"},"lastName":{"stringValue":"${user.LastName}"},"zipCode":{"stringValue":"${user.PostalCode}"},"customerObject":{"mapValue":{"fields":{"currentDate":{"stringValue":"${raffle.currentDate}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"accepts_marketing":{"stringValue":"true"},"addresses":{"arrayValue":{"values":[{"mapValue":{"fields":{"address1":{"stringValue":"${user.Address}"},"address2":{"stringValue":""},"city":{"stringValue":"${user.City}"},"company":{"stringValue":""},"country":{"stringValue":"United States"},"country_code":{"stringValue":"US"},"first_name":{"stringValue":"${user.FirstName}"},"id":{"stringValue":"${user.IdAddress}"},"last_name":{"stringValue":"${user.LastName}"},"phone":{"stringValue":"${user.Phone}"},"province":{"stringValue":"${user.Province}"},"province_code":{"stringValue":"${user.IdProvince}"},"street":{"stringValue":"${user.Address}"},"zip":{"stringValue":"${user.PostalCode}"}}}}]}},"addresses_count":{"stringValue":"${user.Address_Count}"},"email":{"stringValue":"${user.Email}"},"first_name":{"stringValue":"${user.FirstName}"},"has_account":{"stringValue":"true"},"id":{"stringValue":"${user.CustomerId}"},"last_name":{"stringValue":"${user.FirstName}"},"last_order":{"stringValue":""},"name":{"stringValue":"${user.FirstName} ${user.LastName}"},"orders_count":{"stringValue":"0"},"phone":{"stringValue":"${user.Phone}"},"tags":{"stringValue":""},"tax_exempt":{"stringValue":"false"},"total_spent":{"stringValue":"0"},"country":{"stringValue":"France"},"country_code":{"stringValue":"FR"},"ip":{"stringValue":"${user.ip}"}}}},"ip":{"stringValue":"109.209.0.71"},"processed":{"booleanValue":false},"mouseMoved":{"booleanValue":true},"customerMessage":{"stringValue":""},"country":{"stringValue":"United States"},"countryCode":{"stringValue":"US"},"site":{"stringValue":"xhibition.myshopify.com"},"risk":{"stringValue":"null"},"captchaToken":{"stringValue":"${user.captcha}"},"synced":{"booleanValue":false},"isSyncing":{"booleanValue":false},"ccZip":{"stringValue":"not-set"},"ccBrand":{"stringValue":"not-set"},"ccCountry":{"stringValue":"not-set"},"ccLast4":{"stringValue":"not-set"},"groupId":{"integerValue":"${raffle.type == 'Online' ? '55' : '58'}"},"removeCustomerLogin":{"booleanValue":false},"emailOptIn":{"booleanValue":false},"secretCustomerId":{"stringValue":"${raffle.secretCustomerId}"}}}}]}`
      })
    })

    if (response.data.includes('1')) {
      console.log('Entry success')
    } else {
      console.log('entry error')
    }

  } catch (err) {
    if (await handleProxyError(err) !== null) {
      return 2
    }
    console.log(err)

  }
}

const xhibitionEntry4 = async (proxy, user, raffle) => {
  proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
          username: proxy.user,
          password: proxy.password
      }
  }
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
          proxy: { host: '127.0.0.1',
          port: '8888' },
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
              'req0___data__': `{"streamToken":"EAEZEGhCAoH0tbU=","writes":[{"update":{"name":"projects/launches-by-seed/databases/(default)/documents/submission_tracking/${raffle.campaignId}-${user.CustomerId}","fields":{"currentDate":{"stringValue":"${m.format()}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"customerId":{"stringValue":"${user.CustomerId}"},"site":{"stringValue":"xhibition.myshopify.com"},"email":{"stringValue":"${user.Email}"},"phone":{"stringValue":"${user.Phone}"},"ip":{"stringValue":"${user.ip}"}}}}]}`

          })
      })


  } catch (err) {
      if (await handleProxyError(err) !== null) {
          return 2
      }

      console.log(err)
  }
}
const getIP = async (proxyconfig) => {
  proxyconfig = {
    host: proxy.ip,
    port: proxy.port,
    auth: {
        username: proxy.user,
        password: proxy.password
    }
}
  try {
    const resp = await axios({


      method: 'get',
      url: 'https://api.ipify.org?format=json',
      proxy: proxyconfig,
      timeout: 10000,
    });


    return resp.data.ip

  } catch (err) {
  }
}


async function raffleXhibition(raffle) {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


  var m = moment();
  const user = {
    'email': 'bastien-bouge@hotmail.fr',
    'password': 'yoloyolo'
  };

  const proxyConfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  // get "now" as a moment
  var s = m.format();

  raffle = {
    link: 'https://xhibition.co/pages/raffle-1',
    title: "Air Jordan 1 Retro High 'Electro Orange'",
    currentDate: '2021-07-16T09:06:00.000-05:00',
    campaignId: 'HFMUrCUOpWA2JI0eZF1i',
    dataLogin: {
      SID: 'PjnugXr_GrgekJS2FmzgsA',
      gsessionid: 'CFPvySxazimmDsaWmdPu_XU35KYIpRB1RnpLeTrCQv0'
    },
    type: 'Online',
    status: 'open',
    models: 'QzithTNpjLNM5Mj5fII9',
    secretCustomerId: '1626281899892_8635545',
    modelName: "Adult 'Electro Orange' ($170)",
    location: 'Met0nDX892eH2kCsvAyU',
    locationName: 'Xhibition.co (Online)',
    sizes: [
      '7',    '7.5',  '8',
      '8.5',  '9',    '9.5',
      '10',   '10.5', '11',
      '11.5', '12',   '13',
      '14'
    ],
    inventory: [
      '0', '0', '0', '0',
      '0', '0', '0', '0',
      '0', '0', '0', '0',
      '0'
    ]
  }



  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n Xhibition | Raffle Mode | ${raffle.title}`))
  console.log("----------------------------------------------------------------------\n")

  console.log('Size available :', ...raffle.sizes)

  let tabRange = []

  console.log('\nFrom Size ?')
  FromSize = inputReader.readFloat()
  console.log('To Size')
  ToSize = inputReader.readFloat()
  if (FromSize > ToSize) return
  for (j = 0; j < raffle.sizes.length; j++) {
    if (raffle.sizes[j] >= FromSize && raffle.sizes[j] <= ToSize) {
      tabRange.push(raffle.sizes[j])
    }
  }
  if (tabRange == '') {
    console.log(`[Error] Wrong size`)
    await sleep(5000)
    return
  }
  console.log(`\n[Info] Size range :`, ...tabRange)

  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n Xhibition | Raffle Mode | ${raffle.title}`))
  console.log("----------------------------------------------------------------------\n")

  console.log(`\n[Info] Size range :`, ...tabRange)
  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n Xhibtion | Raffle Mode | ${raffle.title}`))
  console.log("----------------------------------------------------------------------\n")

  console.log(`\n[Info] Size range :`, ...tabRange)



  // console.log(JSON.parse(country))


  var registerData = []
  await new Promise(async function (resolve) {
      registerData = await csvRaffleXhibition();
      resolve();
  });

  var proxyData = []
  await new Promise(async function (resolve) {
      proxyData = await csvproxyreader();
      resolve();
  });

  let i = 0
  let proxyN = 0
  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n XHibition | Raffle Mode | ${raffle.title}`))
  console.log("----------------------------------------------------------------------\n")



  for (let i = 0; i < registerData.length; i++) {



      user = registerData[i]
      user.size = tabRange[Math.floor(Math.random() * tabRange.length)]
      console.log('New Task ' + user.Email)

      sessionId = await getSessionId(proxyData[proxyN], user)
      if (sessionId == 2) {
          proxyN++
          sessionId = await getSessionId(proxyData[proxyN], user)
      }

      if (sessionId != 1) {


          error = await getInformation(proxyData[proxyN], user, sessionId)
          if (error == 2) {
              proxyN++
              error = await getInformation(proxyData[proxyN], user, sessionId)
          }
          if (error != 1) {

              console.log('Récupération Info')

              await xhibitionEntry1(proxyData[proxyN], user)
              
              user.ip = await getIP(proxyData[proxyN])
              if (user.ip == 2) {
                  proxyN++
                  error = await getIP(proxyData[proxyN])
              }
            
              xhibitionEntry2(proxyData[proxyN], user)

              console.log('HCAPTCHA')
              await solvedHcaptcha('5d390af4-7556-44d7-b77d-2a4ade3ee3b2', 'eu.kith.com', onCaptchaSolved);
              async function onCaptchaSolved(solvedCaptcha) {
                  user.captcha = solvedCaptcha
              }

              error = await xhibitionEntry3(proxyData[proxyN], user, raffle)
              if (error == 2) {
                  proxyN++
                  error = await xhibitionEntry3(proxyData[proxyN], user, raffle)
              }
              error = await xhibitionEntry4(proxyData[proxyN], user, raffle)
              if (error == 2) {
                  proxyN++
                  error = await xhibitionEntry4(proxyData[proxyN], user, raffle)
              }
              proxyN++
              console.log('------------------------------')
          }
      }
  }

}

raffleXhibition()
// 
module.exports = {
  raffleXhibition
}