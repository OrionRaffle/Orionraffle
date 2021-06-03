
const axios = require('axios-https-proxy-fix')
const aws4 = require('aws4')

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

const entryRaffle = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  usercsv,
  idPayment,
  idAddress,
  proxy,
  size,
  idRaffle
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
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/signup`,
    path: `/Prod/api/signup`,
    service: 'execute-api',
    timeout:10000,
    proxy: proxyconfig,
    data: {
      raffleId: idRaffle,
      addressId: idAddress,
      paymentId: idPayment,
      externalReference: size,
      pickupLocation: 'Online',
      reDrawAccepted: usercsv.ReDraw,
    },
    body: JSON.stringify({
      raffleId: idRaffle,
      addressId: idAddress,
      paymentId: idPayment,
      externalReference: size,
      pickupLocation: 'Online',
      reDrawAccepted: usercsv.ReDraw,
    }),
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
      console.log(`[Error][${usercsv.Email}] Proxy error`)
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(`[Error][${usercsv.Email}] Proxy error`)
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.code == 'ECONNRESET') {
      console.log(`[Error][${usercsv.Email}] Proxy error`)
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.response.status == '407') {
      console.log(`[Error][${usercsv.Email}] Proxy error`)
      console.log('[Info] Waiting for the next task')
      return -1
    }

    if (err.response.status == '502') {
      console.log(`[Error][${usercsv.Email}] Proxy too slow error`)
      console.log('[Info] Waiting for the next task')
      return -1
    }
    console.log([`[${usercsv.Email}] Error when entering the raffle`])
    return 0
  }
}

const getRaffleDataAdvanced = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  proxy,
  username
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
  const r = getRandomInt(1001, 9999)
  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'GET',
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/configurations?cacheBust=${r}`,
    path: `//Prod/api/configurations?cacheBust=${r}`,
    proxy: proxyconfig,
    timeout:10000,
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

  try {
    const resp = await axios(signedRequest)
    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(`[Error][${username}] Proxy error`)
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(`[Error][${username}] Proxy error`)
      console.log('[Info] Waiting for the next task')
      return 0
    }

    if (err.code == 'ECONNRESET') {
      console.log(`[Error][${username}] Proxy error`)
      console.log('[Info] Waiting for the next task')
      return 0
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error][${usercsv.Email}] Proxy error`))
      console.log('[Info] Waiting for the next task')
      return -1
    }
    if (err.response.status == '407') {
      console.log(`[Error][${username}] Proxy error`)
      console.log('[Info] Waiting for the next task')
      return 0
    }

    if (err.response.status == '502') {
      console.log(`[Error][${username}] Proxy too slow error`)
      console.log('[Info] Waiting for the next task')
      return 0
    }

    return 0
  }
}

const IterableventTrackRaffle = async (csv, account, proxy) => {
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
  const uuid = require('uuid-random')
  const n = getRandomInt(0, device.length)
  const d = device[n]
  const shoeSize = csv.Size.split(':')
  try {
    const resp = await axios({
      headers: {
        'api-key': 'e698df3beb42400caf7c3e0a323019b9',
        'User-Agent': 'aws-amplify/1.2.3 react-native',
        'content-type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      url: 'https://api.iterable.com:443/api/events/track',
      data: {
        email: csv.Email,
        eventName: 'AppRaffleSignupEvent',
        dataFields: {
          Sku: csv.Size,
          Color: 'White/Arctic Punch-Hyper Pink',
          Name: 'Air Jordan 12 Retro (GS)',
          Price: 1199,
          PickUpLocation: 'Online',
          PaymentMethodValidated: true,
          PhoneValidated: false,
          ShippingAddressValidated: false,
          ShoeSize: shoeSize[2],
          ShoeSizeSystem: 'US',
          UserId: 249683,
          EdgeUserId: 5972643,
          Country: 'FR',
          Locale: 'fr-FR',
          InstallationId: uuid(),
          Version: '1.2.9.386',
          Timezone: 'Europe/Paris',
          Language: 'fr',
          Device: `Apple${d}`,
        },
        createdAt: new Date().getTime(),
      },
      proxy: proxyconfig,
    })
    return resp.data
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

module.exports = {
  entryRaffle,
  getRaffleDataAdvanced,
  IterableventTrackRaffle,
}
