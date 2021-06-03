const axios = require('axios-https-proxy-fix')
const mysql = require('mysql')
const colors = require('colors')

const uuid = require('uuid')

uuidFootshop = uuid.v4()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const getId = async (proxy) => {
  if (proxy !== 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',
        Connection: 'keep-alive',
      },

      method: 'GET',
      url: 'https://releases.footshop.com/api/shop/detect',

      proxy: proxyconfig,
      timeout:10000,
    })

    return resp.headers['set-cookie']
  } catch (err) {
    // Handle Error Here
  }
}

const checkDuplicity = async (csv, phone, proxy, id) => {
  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',
        Connection: 'keep-alive',
      },
      host: 'releases.footshop.com',
      method: 'POST',
      url: `https://releases.footshop.com/api/registrations/check-duplicity/${id}`,

      data: {
        email: csv.Email,
        phone: `+337${phone}`,
        id: 'null',
      },
      proxy: proxyconfig,
      timeout:10000,
    })

    return resp.data
  } catch (err) {
    // Handle Error Here

    console.log(colors.brightRed(`[Error][${csv.Email}] Proxy error`))
    return -1
  }
}
const createToken = async () => {
  const date = new Date()

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',
        Connection: 'keep-alive',
      },
      host: 'js.checkout.com',
      method: 'POST',
      url: 'https://js.checkout.com/framesv2/log',

      data: {
        data: {
          publicKey: 'pk_76be6fbf-2cbb-4b4a-bd3a-4865039ef187',
          framesVersion: '2.13.2',
          locale: 'EN-GB',
          customLocalization: null,
          integrationType: 'wireframe',
          eventName: 'ready',
          browser: {
            name: 'chrome',
            version: '87.0.4280',
            os: 'Windows 10',
            innerWidth: 1536,
            innerHeight: 726,
            outerWidth: 1536,
            outerHeight: 824,
          },
          datetime: date,
          timestamp: date.getTime(),
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
          sessionId: uuid.v4(),
          merchantDomain: 'releases.footshop.com',
          isCookies: true,
          connectionType: '4g',
          referrer: '',
        },
        tag: 'frames-v2-client',
      },
      proxy: null,
    })
  } catch (err) {
    // Handle Error Here
  }
}

const tokenCC = async (csv, proxy) => {
  if (proxy !== 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',
        AUTHORIZATION: 'pk_76be6fbf-2cbb-4b4a-bd3a-4865039ef187',
      },
      host: 'api.checkout.com',
      method: 'POST',
      url: 'https://api.checkout.com/tokens',
      timeout:10000,

      data: {
        type: 'card',
        number: csv.CardNumber,
        expiry_month: csv.MM,
        expiry_year: csv.YYYY,
        cvv: csv.CVC,
        phone: {},
        requestSource: 'JS',
      },
      proxy: proxyconfig,
    })

    return resp.data
  } catch (err) {
    // Handle Error Here

    console.log(
      colors.brightRed(`[Error][${csv.Email}] Error when adding payment`)
    )
    return -1
  }
}

const getIdHcaptcha = async (key, proxy) => {
  proxyconfig = {
    host: proxy.ip,
    port: proxy.port,
    auth: {
      username: proxy.user,
      password: proxy.password,
    },
  }

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',
        'content-type': 'application/json',
      },

      method: 'GET',
      url: `http://2captcha.com/in.php?key=${key}&method=hcaptcha&json=1&sitekey=55c7c6e2-6898-49ff-9f97-10e6970a3cdb&pageurl=https://releases.footshop.com/`,
      proxy: proxyconfig,
      timeout:10000,
    })

    switch (resp.data.request) {
      case 'ERROR_ZERO_BALANCE':
        console.log('You have no more money on 2captcha')
        return -1
      case 'ERROR_WRONG_USER_KEY':
        console.log("The key you've provided does not exist.")
        return -1
      case 'ERROR_KEY_DOES_NOT_EXIST':
        console.log("The key you've provided does not exist.")
        return -1

      case 'ERROR_NO_SLOT_AVAILABLE':
        console.log('There is a queue to get a recaptcha solved.')
        return 1
      default: return resp.data.request
    }
   

  } catch (err) {
    return 0
  }
}

const getTokenHcaptcha = async (key, proxy, id) => {
  proxyconfig = {
    host: proxy.ip,
    port: proxy.port,
    auth: {
      username: proxy.user,
      password: proxy.password,
    },
  }

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',
        'content-type': 'application/json',
      },

      method: 'GET',
      url: `http://2captcha.com/res.php?key=${key}&method=hcaptcha&json=1&action=get&id=${id}`,
      proxy: proxyconfig,
      
    })

    if (resp.data.request === 'CAPCHA_NOT_READY') {
      return 1
    }

    return resp.data.request
  } catch (err) {
    return 0
  }
}

const signUpInfo = async (
  csv,
  proxy,
  tokenHcaptcha,
  size,
  phone,
  insta,
  id
) => {
  function between(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
  }

  const day = between(1, 30)
  const month = between(1, 11)
  const year = between(1975, 1990)

  if (proxy !== 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }

  phoneNumber = `06${Math.floor(Math.random() * 900 + 100)}`

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',

        Connection: 'keep-alive',
      },
      host: 'releases.footshop.com',
      method: 'POST',
      url: `https://releases.footshop.com/api/registrations/create/${id}`,

      data: {
        id: null,
        sizerunId: size,
        account: 'New Customer',
        email: csv.Email,
        phone: `07${phone}`,
        gender: 'Mr',
        firstName: csv.FirstName,
        lastName: csv.LastName,
        instagramUsername: insta,
        birthday: `${year}-${month}-${day}`,
        deliveryAddress: {
          country: csv.Country,
          state: '',
          county: '',
          city: csv.City,
          street: csv.Address,
          houseNumber: '0',
          additional: '',
          postalCode: csv.PostalCode,
        },
        consents: ['privacy-policy-101'],
        // "cardToken": token.token,
        // "cardLast4": token.last4,
        // "transactionDetail": {
        //   "cardLastDigits": token.last4,
        //   "cardType": token.card_type,
        //   "cardCategory": token.card_category,
        //   "bin": token.bin,
        //   "scheme": token.scheme,
        //   "issuer": token.issuer,
        //   "issuerCountry": token.issuer_country,
        //   "productId": token.product_id,
        //   "productType": token.type,
        //   "expirationMonth": token.expiry_month,
        //   "expirationYear": token.expiry_year
        // },

        verification: {
          token: tokenHcaptcha,
        },
      },
      proxy: proxyconfig,
      timeout:10000,
    })

    return resp.data
  } catch (err) {
    return -1
  }
}

const signUpCB = async (token, proxy, id, idUser) => {
  if (proxy !== 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',

        Connection: 'keep-alive',
      },
      host: 'releases.footshop.com',
      method: 'POST',
      url: `https://releases.footshop.com/api/registrations/finish/${id}`,

      data: {
        registrationId: idUser,
        cardToken: token.token,
        cardLast4: token.last4,
        transactionDetail: {
          cardLastDigits: token.last4,
          cardType: token.card_type,
          cardCategory: token.card_category,
          bin: token.bin,
          scheme: token.scheme,
          issuer: token.issuer,
          issuerCountry: token.issuer_country,
          productId: token.product_id,
          productType: token.type,
          expirationMonth: token.expiry_month,
          expirationYear: token.expiry_year,
        },
      },
      proxy: proxyconfig,
      timeout:10000,
    })

    return resp.data
  } catch (err) {
    return -1
  }
}

async function getRaffleId() {
  let idFootshop
  const connection = mysql.createConnection({
    host: '185.31.40.53',
    user: 'orion',
    password: '785421BG',
    database: 'orion_user',
  })

  connection.connect()
  q = `SELECT idRaffle from website where website="footshop"`

  connection.query(q, (error, results) => {
    if (error) throw error

    idFootshop = results
  })
  await sleep(1500)
  connection.end()
  return idFootshop
}

const getRaffleData = async (idRaffle, proxy) => {
  proxyconfig = {
    host: proxy.ip,
    port: proxy.port,
    auth: {
      username: proxy.user,
      password: proxy.password,
    },
  }

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',

        Connection: 'keep-alive',
      },
      host: 'releases.footshop.com',
      method: 'GET',
      url: `https://releases.footshop.com/api/raffles/${idRaffle}`,
      proxy: proxyconfig,
    })

    return resp.data
  } catch (err) {
    // Handle Error Here
  }
}

// async function main(){

//      cookie = await getId()
//     //  await checkDuplicity(cookie)
//      await createToken()
//     token = await tokenCC()
//     res = await hcaptcha()

//     tokenHcaptcha = res.data

//     await signUp(cookie,token,tokenHcaptcha)
//     await getRaffle()

// }

// main()

module.exports = {
  getRaffleId,
  getRaffleData,
  getId,
  signUpInfo,
  signUpCB,
  tokenCC,
  checkDuplicity,
  getIdHcaptcha,
  getTokenHcaptcha,
}
