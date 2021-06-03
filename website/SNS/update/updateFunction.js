/* eslint-disable no-unused-vars */
const rp = require('request-promise-native')
const axios = require('axios-https-proxy-fix')
const aws4 = require('aws4')
const adyenEncrypt = require('node-adyen-encrypt')(25)
const colors = require('colors')
const { csvrafflereaderFootshop } = require('../../../init')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

const addAddress = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  usercsv,
  proxy
) => {
  if (proxy != 0) {
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
  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'POST',
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/address`,
    path: `/Prod/api/address`,
    service: 'execute-api',
    timeout:10000,
    proxy: proxyconfig,
    body: JSON.stringify({
      shippingFirstName: usercsv.FirstName,
      shippingLastName: usercsv.LastName,
      shippingCountryCode: usercsv.Country,
      shippingAddress1: usercsv.Address,
      shippingAddress2: usercsv.Address2,
      shippingZip: usercsv.PostalCode,
      shippingCity: usercsv.City,
      useOneAddress: true,
      isDefault: true,
    }),

    data: {
      shippingFirstName: usercsv.FirstName,
      shippingLastName: usercsv.LastName,
      shippingCountryCode: usercsv.Country,
      shippingAddress1: usercsv.Address,
      shippingAddress2: usercsv.Address2,
      shippingZip: usercsv.PostalCode,
      shippingCity: usercsv.City,
      useOneAddress: true,
      isDefault: true,
    },
    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  delete signedRequest.headers.host
  delete signedRequest.headers['Content-Length']
  try {
    const resp = await axios(signedRequest)
    return resp
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${usercsv.Email}] Proxy too slow error`)
      )
      console.log('[Info] Waiting for the next task')
      return -1
    }
    console.log(
      colors.brightRed(`[${usercsv.Email}] Error when adding address`)
    )
    return 0
  }
}

const addNumber = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  proxy,
  usercsv,
  phoneNumber
) => {
  if (proxy != 0) {
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
  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'POST',
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/account`,
    path: `/Prod/api/account`,
    service: 'execute-api',
    timeout:10000,
    proxy: proxyconfig,
    body: JSON.stringify({ phoneNumber }),

    data: { phoneNumber },
    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  delete signedRequest.headers.host
  delete signedRequest.headers['Content-Length']
  try {
    const resp = await axios(signedRequest)
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${usercsv.Email}] Proxy too slow error`)
      )
      console.log('[Info] Waiting for the next task')
      return -1
    }
    return 0
  }
}

const sendSMS = async (proxy, usercsv, phoneNumber, accessToken) => {
  if (proxy != 0) {
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
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target':
          'AWSCognitoIdentityProviderService.UpdateUserAttributes',
        Connection: 'keep-alive',
      },
      method: 'POST',
      timeout:10000,
      proxy: null,
      url: 'https://cognito-idp.eu-west-1.amazonaws.com/',
      data: {
        AccessToken: accessToken,
        UserAttributes: [{ Name: 'phone_number', Value: phoneNumber }],
      },
    })

    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${usercsv.Email}] Proxy too slow error`)
      )
      console.log('[Info] Waiting for the next task')
      return -1
    }
    console.log(colors.brightRed(`[${usercsv.Email}] Error send SMS`))
    return 0
  }
}
const sendCode = async (proxy, usercsv, phoneNumber, accessToken, code) => {
  if (proxy != 0) {
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
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.VerifyUserAttribute',
        Connection: 'keep-alive',
      },
      method: 'POST',
      proxy: null,
      timeout:10000,
      url: 'https://cognito-idp.eu-west-1.amazonaws.com/',
      data: {
        AttributeName: 'phone_number',
        Code: code,
        AccessToken: accessToken,
      },
    })

    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${usercsv.Email}] Proxy too slow error`)
      )
      console.log('[Info] Waiting for the next task')
      return -1
    }
    console.log(colors.brightRed(`[${usercsv.Email}] Error send SMS`))
    return 0
  }
}

const getVerified = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  proxy
) => {
  if (proxy != 0) {
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

  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'GET',
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/account?verify=true`,
    path: `/Prod/api/account?verify=true`,
    service: 'execute-api',
    timeout:10000,
    proxy: proxyconfig,
    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  delete signedRequest.headers.host
  delete signedRequest.headers['Content-Length']
  try {
    const resp = await axios(signedRequest)
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${usercsv.Email}] Proxy too slow error`)
      )
      console.log('[Info] Waiting for the next task')
      return -1
    }
    console.log(colors.brightRed(`[${usercsv.Email}] Error Verified`))
    return 0
  }
}

const addCreditCard = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  usercsv,
  proxy
) => {
  if (proxy != 0) {
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

  const adyenKey =
    '10001|EA3BAFD90ABF8CB6A9055C3081C01F20B978B64CA9A8F7256D251417CDB9CBFBA552BE30C6A6928673404D62CF878BAFA5DE80BD77E53546F68317FF13D1649CA2A1CE7F1B6FE3F314B01DC7DE62EE16E94D2C4313F29F4578026FBF349B1E1BD6F0F0BEDB3B32FDC1149F40D59BDD989972EFF8DEC42EFCCCEFD586A24175443AF5915EFB39558D333553F56BF34BEB5DA36EECC6527F21FD7A608595E9696C876315FBCF85AD9CF59B019682738882C42E25CBAE3A5A808F20E9F4A0D3C60994581A78A18295CFCC6119B4C3B5E142814A92D0457B78FE17B89C8DC0B359765865988B37674863EC0FE2E240427667FA58866196635DB93A0E1D0B3AA84907'
  const options = {}
  const cardData = {
    number: usercsv.CardNumber,
    cvc: usercsv.CVC, // 'xxx'
    holderName: `${usercsv.FirstName} ${usercsv.LastName}`, // 'John Doe'
    expiryMonth: usercsv.MM, // 'MM'
    expiryYear: usercsv.YYYY, // 'YYYY'
    generationtime: new Date().toISOString(), // new Date().toISOString()
  }
  const cseInstance = adyenEncrypt.createEncryption(adyenKey, options)
  cseInstance.validate(cardData)
  const dataEncrypted = cseInstance.encrypt(cardData)

  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'POST',
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/payments`,
    path: `/Prod/api/payments`,
    service: 'execute-api',
    timeout:10000,
    proxy: proxyconfig,
    body: JSON.stringify({
      encrypted: dataEncrypted,
      currency: 'EUR',
    }),

    data: {
      encrypted: dataEncrypted,
      currency: 'EUR',
    },
    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  delete signedRequest.headers.host
  delete signedRequest.headers['Content-Length']
  try {
    const resp = await axios(signedRequest)
    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${usercsv.Email}] Proxy too slow error`)
      )
      console.log('[Info] Waiting for the next task')
      return -1
    }
    console.log(
      colors.brightRed(`[${usercsv.Email}] Error when adding payment`)
    )
    return 0
  }
}

const removeAddress = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  usercsv,
  proxy,
  idaddress
) => {
  if (proxy != 0) {
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
  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'DELETE',
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/address/${idaddress}`,
    path: `/Prod/api/address/${idaddress}`,
    service: 'execute-api',
    timeout:10000,
    proxy: proxyconfig,

    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  delete signedRequest.headers.host
  delete signedRequest.headers['Content-Length']
  try {
    const resp = await axios(signedRequest)
    return resp
  } catch (err) {
    console.log(err)
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${usercsv.Email}] Proxy too slow error`)
      )
      console.log('[Info] Waiting for the next task')
      return -1
    }
    console.log(
      colors.brightRed(`[${usercsv.Email}] Error when removing address`)
    )
    return 0
  }
}

const getAdyenLink = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  usercsv,
  proxy
) => {
  // if (proxy != 0) {
  //   proxyconfig = {
  //     host: proxy.ip,
  //     port: proxy.port,
  //     auth: {
  //       username: proxy.user,
  //       password: proxy.password
  //     }
  //   }
  // } else {
  //   proxyconfig = null
  // }

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  const r = getRandomInt(10001, 99999)
  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'GET',
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/adyen/paymentLinks?cacheBust=${r}`,
    path: `/Prod/api/adyen/paymentLinks?cacheBust=${r}`,
    service: 'execute-api',
    proxy: proxyconfig,

    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  delete signedRequest.headers.host
  delete signedRequest.headers['Content-Length']
  try {
    const resp = await axios(signedRequest)

    return resp.data.url
  } catch (err) {
    console.log(err)
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    

    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${usercsv.Email}] Proxy too slow error`)
      )
      console.log('[Info] Waiting for the next task')
      return -1
    }
    console.log(
      colors.brightRed(`[${usercsv.Email}] Error when removing address`)
    )
    return 0
  }
}

const getClientKey = async (linkAdyen) => {
  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }

  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      },

      method: 'GET',
      url: `https://checkoutshopper-live.adyen.com/checkoutshopper/v67/paybylink/setup?d=${
        linkAdyen.split('=')[1]
      }`,
      proxy: proxyconfig,
    })

    return resp.data.clientKey
  } catch (err) {
    // Handle Error Here
    console.log(err)
  }
}

const getConversationId = async (clientKey) => {
  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }

  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      },

      method: 'POST',
      url: `https://checkoutshopper-live.adyen.com/checkoutshopper/v1/analytics/id?clientKey=${clientKey}`,
      proxy: proxyconfig,
    })

    return resp.data.id
  } catch (err) {
    // Handle Error Here
    console.log(err)
  }
}
const getTokens = async (clientKey, conversionId, usercsv, linkAdyen) => {
  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  const adyenKey =
    '10001|EA3BAFD90ABF8CB6A9055C3081C01F20B978B64CA9A8F7256D251417CDB9CBFBA552BE30C6A6928673404D62CF878BAFA5DE80BD77E53546F68317FF13D1649CA2A1CE7F1B6FE3F314B01DC7DE62EE16E94D2C4313F29F4578026FBF349B1E1BD6F0F0BEDB3B32FDC1149F40D59BDD989972EFF8DEC42EFCCCEFD586A24175443AF5915EFB39558D333553F56BF34BEB5DA36EECC6527F21FD7A608595E9696C876315FBCF85AD9CF59B019682738882C42E25CBAE3A5A808F20E9F4A0D3C60994581A78A18295CFCC6119B4C3B5E142814A92D0457B78FE17B89C8DC0B359765865988B37674863EC0FE2E240427667FA58866196635DB93A0E1D0B3AA84907'
  const options = {}
  let cardData = {
    cvc: usercsv.CSV, // 'xxx'
    generationtime: new Date().toISOString(),
  }
  let cseInstance = adyenEncrypt.createEncryption(adyenKey, options)
  cseInstance.validate(cardData)
  const cvc = cseInstance.encrypt(cardData)

  cardData = {
    expiryMonth: usercsv.MM, // 'MM'
    generationtime: new Date().toISOString(),
  }
  cseInstance = adyenEncrypt.createEncryption(adyenKey, options)
  cseInstance.validate(cardData)
  const mm = cseInstance.encrypt(cardData)

  cardData = {
    expiryYear: usercsv.YYYY, // 'YYYY'
    generationtime: new Date().toISOString(),
  }
  cseInstance = adyenEncrypt.createEncryption(adyenKey, options)
  cseInstance.validate(cardData)
  const yy = cseInstance.encrypt(cardData)

  cardData = {
    number: usercsv.CardNumber, // 'xxxx xxxx xxxx xxxx'             //'xxx'
    generationtime: new Date().toISOString(),
  }
  cseInstance = adyenEncrypt.createEncryption(adyenKey, options)
  cseInstance.validate(cardData)
  const cardNumber = cseInstance.encrypt(cardData)

  console.log(mm)

  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      },

      method: 'POST',
      url: `https://checkoutshopper-live.adyen.com/checkoutshopper/v67/paybylink/payments?d=${
        linkAdyen.split('=')[1]
      }`,
      proxy: proxyconfig,
      data: {
        conversionId,
        paymentMethod: {
          type: 'scheme',
          encryptedCardNumber: cardNumber,
          encryptedExpiryMonth: mm,
          encryptedExpiryYear: yy,
          encryptedSecurityCode: cvc,
          brand: 'mc',
        },
        browserInfo: {
          acceptHeader: '*/*',
          colorDepth: 32,
          language: 'fr-fr',
          javaEnabled: false,
          screenHeight: 812,
          screenWidth: 375,
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
          timeZoneOffset: -120,
        },
        clientStateDataIndicator: true,
      },
    })

    console.log(resp.data)
  } catch (err) {
    // Handle Error Here
    console.log(err)
  }
}

module.exports = {
  addAddress,
  addCreditCard,
  sendSMS,
  addNumber,
  sendCode,
  getVerified,
  removeAddress,
  getAdyenLink,
  getClientKey,
  getTokens,
  getConversationId,
  // entryRaffle
}
