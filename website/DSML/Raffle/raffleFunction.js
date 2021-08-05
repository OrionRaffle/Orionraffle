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

const {
  handleProxyError
} = require('../../../utils/utils');
var m = moment();

const inputReader = require('wait-console-input')

const clear = require('console-clear')
const setTitle = require('node-bash-title')
const chalk = require('chalk')
const figlet = require('figlet')
const colors = require('colors')
const lineReader = require('line-reader')

const { csvRaffleDSML } = require('../../../utils/csvReader');

const {
  csvproxyreader,
  csvconfigreader,
} = require('../../../init');

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getCurrentDate = async(proxy,link) => {
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

     
      timeout: 5000,
      method: 'GET',
      url: `https://shop.doverstreetmarket.com/collections/raffle/products/` + link,
     
    })

    a = response.data
    return a.split("'currentDate': '")[1].split("'")[0]

  } catch (err) {

    if (await handleProxyError(err) !== null) {
      return 2
    }
    console.log(err)
    return 0

  }
}

const getDataStripe = async (proxy, user) => {
  proxyConfig = {
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
      proxy: null,
      withCredentials: true,
      timeout: 5000,
      method: 'POST',
      url: `https://api.stripe.com/v1/tokens`,
      data: qs.stringify({
        'card[number]': user.CardNumber,
        'card[cvc]': user.CSV,
        'card[exp_month]': user.MM,
        'card[exp_year]': user.YY,
        'card[address_zip]': user.PostalCode,
        'payment_user_agent': 'stripe.js/a20eed6a6; stripe-js-v3/a20eed6a6',
        'time_on_page': '140907',
        'referrer': 'https://shop.doverstreetmarket.com/',
        'key': 'pk_live_51IREZGKzFfjknAO2QG1VEFC1UEbaoQOKH528xrVXIVTeIfCRcfGCj6gGHnnYJ2H1Q2DvYErlowQ6oqWdRV7j54PO00b6Vxtg1t',
        'pasted_fields': 'number'
      })
    })

    return response.data

  } catch (err) {

    if (await handleProxyError(err) !== null) {
      return 2
    }
    console.log(err)
    return 2

  }
}



const dsmlEntry1 = async (proxy, user, rid) => {
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
      proxy:proxyconfig,
      withCredentials: true,
      timeout: 5000,
      method: 'POST',
      url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
      params: {
        'database': 'projects/launches-by-seed/databases/(default)',
        'VER': '8',
        'RID': rid,
        'CVER': '22',
        'X-HTTP-Session-Id': 'gsessionid',
        '$httpHeaders': 'X-Goog-Api-Client:gl-js/ fire/7.23.0Content-Type:text/plain',
        // 'zx	': randomstring.generate(12).toLowerCase(),
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
    return 2

  }
}
const dsmlEntry2 = async (proxy, user) => {
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
      proxy: proxyconfig,
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
      return 2
    }
    console.log(err)
    return 2
  }
}
const dsmlEntry3 = async (proxy, user, raffle, rid) => {

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
      proxy: proxyconfig,
      timeout: 5000,
      withCredentials: true,
      method: 'POST',
      url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
      params: {
        'database': 'projects/launches-by-seed/databases/(default)',
        'VER': '8',
        'gsessionid': user.gsessionid,
        'SID': user.SID,
        'RID': rid,
        'AID': '1',
        // 'zx	': randomstring.generate(11).toLowerCase(),
        't': '1',
      },
      data: qs.stringify({
        'count': '1',
        'ofs': '1',
        'req0___data__': `{"streamToken":"GRBoQgKB9LW1","writes":[{"update":{"name":"projects/launches-by-seed/databases/(default)/documents/submissions/${raffle.campaignId}-${user.CustomerId}","fields":{"currentDate":{"stringValue":"${m.format()}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"customerId":{"stringValue":"${user.CustomerId}"},"type":{"stringValue":""},"size":{"stringValue":" ${user.size} UK"},"model":{"stringValue":"${raffle.models}"},"modelName":{"stringValue":"${raffle.modelName}"},"location":{"stringValue":"${raffle.location}"},"locationName":{"stringValue":"${raffle.locationName}"},"email":{"stringValue":"${user.Email}"},"phone":{"stringValue":"${user.Phone}"},"firstName":{"stringValue":"${user.FirstName}"},"lastName":{"stringValue":"${user.LastName}"},"zipCode":{"stringValue":"${user.PostalCode}"},"customerObject":{"mapValue":{"fields":{"currentDate":{"stringValue":"${user.currentDate}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"accepts_marketing":{"stringValue":""},"addresses":{"arrayValue":{"values":[]}},"addresses_count":{"stringValue":""},"email":{"stringValue":""},"first_name":{"stringValue":""},"has_account":{"stringValue":""},"id":{"stringValue":""},"last_name":{"stringValue":""},"last_order":{"stringValue":""},"name":{"stringValue":""},"orders_count":{"stringValue":""},"phone":{"stringValue":"${user.Phone}"},"tags":{"stringValue":""},"tax_exempt":{"stringValue":""},"total_spent":{"stringValue":""},"country":{"stringValue":"not-set"},"country_code":{"stringValue":"not-set"},"ip":{"stringValue":"${user.ip}"}}}},"ip":{"stringValue":"${user.ip}"},"processed":{"booleanValue":false},"mouseMoved":{"booleanValue":true},"customerMessage":{"stringValue":""},"country":{"stringValue":"GB"},"countryCode":{"stringValue":"GB"},"site":{"stringValue":"dsm-london.myshopify.com"},"risk":{"stringValue":"null"},"captchaToken":{"stringValue":"${user.captcha}"},"synced":{"booleanValue":false},"isSyncing":{"booleanValue":false},"ccZip":{"nullValue":"NULL_VALUE"},"ccBrand":{"stringValue":"${user.brand}"},"ccCountry":{"stringValue":"${user.countryCC}"},"ccLast4":{"stringValue":"${user.last4}"},"groupId":{"integerValue":"${user.groupId}"},"removeCustomerLogin":{"booleanValue":false},"emailOptIn":{"booleanValue":false},"secretCustomerId":{"stringValue":"${raffle.secretCustomerId}"}}}}]}`
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
    return 2
  }
}

const dsmlEntry4 = async (proxy, user, raffle, rid) => {
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
      proxy: proxyconfig,
      timeout: 5000,
      withCredentials: true,
      method: 'POST',
      url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel`,
      params: {
        'database': 'projects/launches-by-seed/databases/(default)',
        'VER': '8',
        'gsessionid': user.gsessionid,
        'SID': user.SID,
        'RID': rid,
        'AID': '2',
        'zx	': randomstring.generate(11).toLowerCase(),
        't': '1',
      },
      data: qs.stringify({
        'count': '1',
        'ofs': '2',
        'req0___data__': `{"streamToken":"EAEZEGhCAoH0tbU=","writes":[{"update":{"name":"projects/launches-by-seed/databases/(default)/documents/submission_tracking/${raffle.campaignId}-${user.CustomerId}","fields":{"currentDate":{"stringValue":"${m.format()}"},"campaignId":{"stringValue":"${raffle.campaignId}"},"customerId":{"stringValue":"${user.CustomerId}"},"site":{"stringValue":"dsm-london.myshopify.com"},"email":{"stringValue":"${user.Email}"},"phone":{"stringValue":"${user.Phone}"},"ip":{"stringValue":"${user.ip}"}}}}]}`

      })
    })


  } catch (err) {
    if (await handleProxyError(err) !== null) {
      return 2
    }

    console.log(err)
    return 2
  }
}
const getIP = async (proxy) => {

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
    
    if (await handleProxyError(err) !== null) {
      return 2
    }
    console.log(err)
    return 2
  }
}


async function raffleDSML(raffle) {
  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


  var m = moment();


  // get "now" as a moment
  var s = m.format();

  raffle1 = {
    link: 'asics-x-angelo-baque-gel-kayano-14-black-1',
    title: "Asics x Angelo Baque Gel-Kayano 14 (Black)",
    campaignId: 'ERq6d3qJk4cqZPY0AIhj',
    type: 'Online',
    status: 'open',
    models: 'paYIgQcQpZrtwjiaG9Pt',
    secretCustomerId: '1627315607280_1553706',
    modelName: "Asics x Angelo Baque Gel-Kayano 14 (Black)",
    location: 'gyVWPzcG1VYu1JyZQhFc',
    locationName: 'DSML Online',
    sizes: [
      '4','5','6','7','8','9',
      '10', '11', '12'
    ],
    inventory: [
      '0', '0', '8',
      '0', '0', '0',
      '0', '0', '0',
      '0', '0', '0',
      '0', '0'
    ]
  }
  raffle2 = {
    link: 'kanghyuk-x-reebok-classic-leather-red-1',
    title: "Kanghyuk x Reebok Classic Leather (Red)",
    campaignId: 'MWUX2cJ2U5Rd61c1mfis',
    type: 'Online',
    status: 'open',
    models: 'WjeEGYXqrTP9cFDdBzZM',
    secretCustomerId: '1628073470117_483727',
    modelName: "Kanghyuk x Reebok Classic Leather (Red)",
    location: 'UV1SGSUPXrebtW8Jo0YZ',
    locationName: 'DSML Online',
    sizes: [
      '8','9',
      '10', '11'
    ],
    inventory: [
      '0', '0', '8',
      '0', '0', '0',
      '0', '0', '0',
      '0', '0', '0',
      '0', '0'
    ]
  }
  // console.log(raffle)
  // await sleep(400000)
  raffleTab = [raffle1,raffle2]

  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n DSML | Raffle Mode `))
  console.log("----------------------------------------------------------------------\n")

  console.log('1. ' + raffleTab[0].title)  
  console.log('2. ' + raffleTab[1].title)  

  input = inputReader.readInteger()
  if(input == 1) raffle = raffleTab[0]
  else raffle = raffleTab[1]


  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n DSML | Raffle Mode | ${raffle.title}`))
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
  console.log(chalk.rgb(247, 158, 2)(`\n DSML | Raffle Mode | ${raffle.title}`))
  console.log("----------------------------------------------------------------------\n")

  console.log(`\n[Info] Size range :`, ...tabRange)
  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n DSML | Raffle Mode | ${raffle.title}`))
  console.log("----------------------------------------------------------------------\n")

  console.log(`\n[Info] Size range :`, ...tabRange)




  // console.log(JSON.parse(country))



  var registerData = []
  await new Promise(async function (resolve) {
    registerData = await csvRaffleDSML();
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
  console.log(chalk.rgb(247, 158, 2)(`\n DSML | Raffle Mode | ${raffle.title}`))
  console.log("----------------------------------------------------------------------\n")



  for (let i = 0; i < registerData.length; i++) {



    user = registerData[i]
    user.size = tabRange[Math.floor(Math.random() * tabRange.length)]
    console.log('[' + i + '] New Task ' + user.Email)

  

    data = await getDataStripe(proxyData[proxyN], user)

    user.brand = data.card.brand
    user.last4 = data.card.last4
    user.countryCC = data.card.country 

    let heure = Date.now()

    minute = new Date()
    user.CustomerId = String(heure + '_' + Math.floor(99999999999*Math.random()+999))
    user.groupId = String(minute.getMinutes())
    user.currentDate = await getCurrentDate(proxyData[proxyN],raffle.link)
    

    rid = getRandomIntInclusive(10000, 99995),
      console.log('Récupération Info')

    console.log('HCAPTCHA')
    await solvedHcaptcha('5d390af4-7556-44d7-b77d-2a4ade3ee3b2', 'shop.doverstreetmarket.com', onCaptchaSolved);

   
    user.ip = await getIP(proxyData[proxyN])
    while (user.ip == 2) {
      proxyN++
      await sleep(3000)
      error = await getIP(proxyData[proxyN])
    }

    
    console.log("Success Captcha")
    async function onCaptchaSolved(solvedCaptcha) {
      user.captcha = solvedCaptcha
    }

    
    error = await dsmlEntry1(proxyData[proxyN], user, rid)
    if(error == 2){
      proxyN++
      error = await dsmlEntry1(proxyData[proxyN], user, rid)
    }

    rid++
    dsmlEntry2(proxyData[proxyN], user)

   

    await sleep(100)

    function range(start, end) {
      var ans = [];
      for (let i = start; i <= end; i++) {
        ans.push(i);
      }
      return ans;
    }


    error = await dsmlEntry3(proxyData[proxyN], user, raffle, rid)
    if (error == 2) {
      proxyN++
      error = await dsmlEntry3(proxyData[proxyN], user, raffle, rid)
    }
   
    rid++
    error = await dsmlEntry4(proxyData[proxyN], user, raffle, rid)
    if (error == 2) {
      proxyN++
      error = await dsmlEntry4(proxyData[proxyN], user, raffle, rid)
    }
  
    proxyN++
    console.log('------------------------------')

  }



}

// raffleXhibition()
// 
module.exports = {
  raffleDSML
}