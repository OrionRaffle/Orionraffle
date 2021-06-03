const axios = require('axios-https-proxy-fix')
const Captcha = require('2captcha')
const randomstring = require('randomstring')
const inputReader = require('wait-console-input')
const aws4 = require('aws4')
const colors = require('colors')
const qs = require('qs')

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


const newEntry = async (info, proxyconfig,captcha) => {
  
  await entryOptions(proxyconfig)
  fingerprint = randomstring.generate({
    length: 32,
    charset: 'hex',
  })

  try {
    const resp = await axios({
      headers: {
        'accept-encoding':	'gzip, deflate, br',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        "cnnection": 'keep-alive',
        "authorization": `Bearer ${info.tokenId}`,
      },
      method: 'POST',
      proxy: proxyconfig,
      timeout:10000,
      url:
        'https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/new',
      data: {
        clientMetadata: {
          browserFingerprint: fingerprint,
          drawId: info.IdRaffle,
          locale: 'fr-FR',
          timezone: 'Europe/Paris',
          userAgent:'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
          birthdate: info.birthday,
          email: info.Email.trim().toLowerCase(),
          firstName: info.FirstName,
          lastName: info.LastName,
          phone: info.num.trim(),
          preferredName: info.FirstName,
          title: 'MR',
          address1: info.Address,
          address2: info.Address2,
          addressAutoCompleteID: '',
          city: info.City,
          collectionMethod: 'DELIVERY',
          companyName: '',
          country: info.Country.trim(),
          postcode: info.PostalCode,
          shippingName: `${info.FirstName} ${info.LastName}`,
          state: info.State.trim(),
          storeID: '',
          storeName: '',
          billingName: `${info.FirstName} ${info.LastName}`,
          paymentConsent: 'true',
          paymentMethodID: info.payment_method,
          privacyConsent: 'false',
          recaptchaToken: captcha,
          retailerPrivacyConsent: 'false',
          shoeSize: String(info.Size),
          termsConsent: 'true',
          sourceIP: info.ip,
          setupIntentID: info.token
        },
        cognitoID: info.cognitoId,
        consumerID: info.consumerId,
      }
    })
   
    return resp.data
  
  } catch (err) {
  
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }


    if (err.errno == 'ENOENT') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }

    if (err.code == 'ERR_SOCKET_CLOSED') {
      console.log(
        colors.brightRed(`[Error] Proxy does not exist`)
      )
      return -1
    }

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }

    if (err.response.status == '502') {
      console.log(colors.brightRed(`[Error] Proxy too slow error`))
      return -1
    }
    try{
    if (err.response.data.error.includes('OPEN_ENTRY_EXISTS')){
      console.log(colors.brightRed(`[Error][${info.Email}] You have already entered the draw` ))
      return 0
    }

    if (err.response.data.error.includes('DUPLICATE_CARD')){
      console.log(colors.brightRed(`[Error][${info.Email}] Card duplicate`))
      return 0
    }
  }catch(err){}
    return 1
  }
}
const entryOptions = async (proxyconfig) => {
  try {
    const resp = await axios({
      method: 'OPTIONS',
      host:'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
      url:'https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/new',
      path: 'v1/entry/new',
      proxy: proxyconfig,
      timeout:10000,

      headers: {
        'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        'Connection': 'keep-alive',
        'access-control-request-headers': 'authorization',
        'access-control-request-method': 'POST',
      },
    })
  } catch (err) {
    return -1
  }
}

const confirmEntryOptions = async (info, proxyconfig) => {
  try {
    const resp = await axios({
      method: 'OPTIONS',
      url: `https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/confirm?cid=${info.userSub}`,
      proxy: proxyconfig,
      timeout:10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        Connection: 'keep-alive',
        'access-control-request-headers': 'authorization',
        'access-control-request-method': 'POST',
      },
    })
  } catch (err) {
   return -1
  }
}
const confirmNewEntry = async (info, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',

        Connection: 'keep-alive',
        authorization: `Bearer ${info.tokenId}`,
      },
      timeout:10000,
      method: 'POST',
      proxy: proxyconfig,
      url: `https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/confirm?cid=${info.userSub}`,
    })

    return resp.data
  } catch (err) {
    return 1
  }
}
async function logintwo(info, proxy,captcha) {
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

  // proxyconfig = {
  //   host: '127.0.0.1',
  //   port: '8888'
  // }
  error = await newEntry(info, proxyconfig,captcha)
  
  if (error === 0 || error == -1) return error
  await confirmEntryOptions(info, proxyconfig)
  await confirmNewEntry(info, proxyconfig)
}


module.exports = {
  logintwo,
}
