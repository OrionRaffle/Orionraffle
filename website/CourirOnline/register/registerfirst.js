const axios = require('axios-https-proxy-fix');
const aws4 = require("aws4")
const chalk = require('chalk');
const colors = require("colors")
const inputReader = require('wait-console-input')
const qs = require('qs');
const { SRPClient } = require('amazon-user-pool-srp-client');
const mysql = require('mysql');
const { cookie } = require('request-promise');
const path = require("path");

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const getRaffleId = async () => {
  let idCourir
  const connection = mysql.createConnection({
    host: '185.31.40.53',
    user: 'orion',
    password: '785421BG',
    database: 'orion_user',
  })

  connection.connect()
  q = `SELECT idRaffle from website where website="courir"`

  connection.query(q, (error, results) => {
    if (error) throw error

    idCourir = results
  })
  await sleep(1000)
  connection.end()
  return idCourir
}



const getSession = async (info, yolo, proxyconfig) => {


  try {
    const resp = await axios({

      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'Connection': 'keep-alive'
      },
      method: 'POST',
      timeout: 10000,
      url: 'https://cognito-idp.us-east-1.amazonaws.com/',
      data: { "AuthFlow": "USER_SRP_AUTH", "ClientId": "165cbvf0gsromjvtdeor72t0pj", "AuthParameters": { "USERNAME": info.Email.toLowerCase(), "SRP_A": yolo }, "ClientMetadata": {} },
      proxy: proxyconfig

    });

    console.log(colors.brightRed("[Error][" + info.Email + "] Account already exist"))
    return 0


  } catch (err) {

  }
}



function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

const getAmazonToken = async (proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Host': 'cognito-identity.us-east-1.amazonaws.com',
        'Connection': 'keep-alive',
        'Content-Length': 63,
        'x-amz-target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
        'x-amz-user-agent': 'aws-sdk-js-v3-@aws-sdk/client-cognito-identity/1.0.0-gamma.2 Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 aws-amplify/3.3.3 js',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'Accept': '*/*',
        'Origin': 'https://www.sneakql.com',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://www.sneakql.com/',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },

      method: 'post',
      timeout: 10000,
      url: 'https://cognito-identity.us-east-1.amazonaws.com/',
      proxy: proxyconfig,
      data: { "IdentityId": "us-east-1:01871c08-417f-497f-8fe8-bb74b9d93d26" }
    });


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
    try {
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error] Proxy error`))
        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error] Proxy too slow error`)
        )
        return -1
      }
    } catch (err) { }
    return -1

  }

}
const getIP = async (proxyconfig) => {

  try {
    const resp = await axios({


      method: 'get',
      url: 'https://api.ipify.org?format=json',
      proxy: proxyconfig,
      timeout: 10000,
    });


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

    try {
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error] Proxy error`))
        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error] Proxy too slow error`)
        )
        return -1
      }
    } catch (err) { }
    return 0
  }
}

const getRaffleData = async (id) => {

  try {
    const resp = await axios({

      timeout: 10000,
      method: 'get',
      url: `https://www.sneakql.com/page-data/fr-FR/launch/courir/${id}/page-data.json`,


    });


    return resp.data.result.data.prismicDraw.data

  } catch (err) {
    // Handle Error Here
    console.log(err);
  }
}
async function getToken(secretAccessKey, accessKeyId, sessionToken, proxyconfig) {


  const request = {
    host: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
    method: 'GET',
    url: `https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/payment/token`,
    path: `/v1/payment/token`,
    proxy: proxyconfig,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      'content-type': 'application/json',
      'Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      'Accept': 'application/json, text/plain, */*',
      'x-Amz-Security-Token': sessionToken
    }
  }

  const signedRequest = aws4.sign(request,
    {

      secretAccessKey,
      accessKeyId,
      sessionToken
    })

  delete signedRequest.headers.host
  delete signedRequest.headers['Content-Length']
  try {
    const resp = await axios(signedRequest)
    return resp.data
  } catch (err) {

  }

}
const confirm = async (info, token, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'accept': 'application/json',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'fr,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/x-www-form-urlencoded',
        'origin': 'https://js.stripe.com',
        'referer': 'https://js.stripe.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
      },
      method: 'post',

      url: 'https://api.stripe.com/v1/setup_intents/seti_' + token.split('_')[1] + '/confirm',
      timeout: 10000,
      data: qs.stringify({
        "payment_method_data[type]": "card",
        'payment_method_data[billing_details][address][city]': info.City,
        'payment_method_data[billing_details][address][country]': info.Country.trim(),
        'payment_method_data[billing_details][address][line1]': info.Address,
        'payment_method_data[billing_details][address][line2]': info.Address2,
        'payment_method_data[billing_details][address][postal_code]': info.PostalCode.trim(),
        'payment_method_data[billing_details][address][state]': info.State.trim(),
        'payment_method_data[billing_details][email]': info.Email,
        'payment_method_data[billing_details][name]': info.FirstName + " " + info.LastName,
        'payment_method_data[billing_details][phone]': info.num,
        'payment_method_data[card][number]': info.CardNumber.trim(),
        'payment_method_data[card][cvc]': info.CVC.trim(),
        'payment_method_data[card][exp_month]': info.MM.trim(),
        'payment_method_data[card][exp_year]': info.YY.trim(),
        'payment_method_data[payment_user_agent]': 'stripe.js/c1e7aeb75; stripe-js-v3/c1e7aeb75',
        'payment_method_data[referrer]': 'https://www.sneakql.com/',
        'expected_payment_method_type': 'card',
        'use_stripe_sdk': 'false',
        'webauthn_uvpa_available': 'true',
        'spc_eligible': 'false',
        'key': 'pk_live_PhPgbLR5ua2fiuhEPVL4x32H00rsE8tmce',
        'client_secret': token
      })
    });


    return resp.data

  } catch (err) {

    if (err.response.data.error.type.includes("card_error")) {
      console.log(colors.brightRed("[Error][" + info.Email + "] CC invalid"))
      return 0
    }

    return -1
  }

}
const getPareq = async (bigToken, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },
      timeout: 10000,
      method: 'GET',
      url: 'https://hooks.stripe.com/redirect/authenticate/' + bigToken,
      proxy: proxyconfig,

    });


    return resp.data
  } catch (err) {
    // Handle Error Here
    return -1
  }

}

const getForm = async (pareq, linkForm, linkStripe, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },
      timeout: 10000,
      method: 'POST',
      url: linkForm,
      proxy: proxyconfig,
      data: qs.stringify({
        'PaReq': pareq,
        'TermUrl': linkStripe,
        'MD': ''
      })

    });

    return resp.data
  } catch (err) {
    return -1
  }

}

const getRevolutForm = async (pareq, linkStripe, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },

      method: 'POST',
      timeout: 10000,
      url: 'https://idcheck.acs.touchtechpayments.com/v1/payerAuthentication',
      proxy: proxyconfig,
      data: qs.stringify({
        'PaReq': pareq,
        'TermUrl': linkStripe,
        'MD': ''
      })

    });


    return resp.data
  } catch (err) {
    return -1
  }

}

const sendForm = async (newUrl, shortCode, newPareq, linkStripe, code, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },
      timeout: 10000,
      method: 'POST',
      url: 'https://authentication-acs.marqeta.com' + newUrl,
      proxy: proxyconfig,
      data: qs.stringify({
        'MD': '',
        'PaRes': '',
        'otp_attempt_counter_after_kba': '0',
        'is_kba_completed': 'false',
        'pareqToken': newPareq,
        'programShortCode': shortCode,
        'termUrl': linkStripe,
        'oneTimePasscode': code
      })
    });


    return resp.data
  } catch (err) {
    return -1
  }

}
const sendRevolutForm = async (token, proxyconfig) => {

  try {
    const resp = await axios({
      timeout: 10000,
      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },

      method: 'POST',
      url: 'https://poll.touchtechpayments.com/poll',
      proxy: proxyconfig,
      data: {
        "transToken": token
      }
    });


    return resp.data
  } catch (err) {
    return -1
  }

}

const confirmRevolutForm = async (transToken, authToken, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },

      method: 'POST',
      timeout: 10000,
      url: 'https://macs.touchtechpayments.com/v1/confirmTransaction',
      proxy: proxyconfig,
      data: {
        "transToken": transToken,
        "authToken": authToken
      }
    });


    return resp.data
  } catch (err) {
    return -1
  }

}



const redirect3DS = async (pares, linkStripe, proxyconfig) => {
  merchant = linkStripe.split("/")[5]

  secure = linkStripe.split("/")[6].replace(/%20/g, "");

  try {
    const resp = await axios({
      timeout: 10000,
      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },

      method: 'POST',
      url: 'https://hooks.stripe.com/3d_secure/complete/' + merchant + '/' + secure,
      proxy: proxyconfig,
      data: qs.stringify({
        'MD': '',
        'PaRes': pares,
        'splat': '[]',
        'captures': '["' + merchant + '","' + secure + '"]',
        'merchant': merchant,
        'three_d_secure': secure,
      })

    });


    return resp.data
  } catch (err) {
    return -1
  }

}

const RevolutRedirect3DS = async (pares, linkStripe, proxyconfig) => {
  merchant = linkStripe.split("/")[5]

  secure = linkStripe.split("/")[6].replace(/%20/g, "");


  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },

      method: 'POST',
      url: 'https://hooks.stripe.com/three_d_secure/redirect_complete/' + merchant + '/' + secure,
      proxy: proxyconfig,
      timeout: 10000,
      data: qs.stringify({
        'MD': '',
        'PaRes': pares,

      })

    });


    return resp.data
  } catch (err) {
    return -1
  }

}
const confirmRevolut3DS = async (pares, merchant, secure, proxyconfig) => {


  try {
    const resp = await axios({
      timeout: 10000,
      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },

      method: 'POST',
      url: 'https://hooks.stripe.com/3d_secure/complete/' + merchant + '/' + secure,
      proxy: proxyconfig,
      data: qs.stringify({
        'MD': '',
        'PaRes': pares,
        'splat': '[]',
        'captures': '["' + merchant + '","' + secure + '"]',
        'merchant': merchant,
        'three_d_secure': secure,
      })

    });


    return resp.data
  } catch (err) {
    return -1
  }

}

const getSessionQonto = async (pareq, linkStripe, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

      },

      method: 'POST',
      timeout: 10000,
      url: 'https://3dsecure.monext.fr/mdpayacs/pareq',
      proxy: proxyconfig,
      data: qs.stringify({
        'PaReq': pareq,
        'TermUrl': linkStripe,
        'MD': ''
      })

    });


    return resp.data
  } catch (err) {
    return -1
  }

}

const getQonto = async (link, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',

      },

      method: 'POST',
      timeout: 10000,
      url: link,
      proxy: proxyconfig,
      data: qs.stringify({
        'action': 'submit',
        'submit': 'SUIVANT'
      })

    });



  } catch (err) {
    return -1
  }

}
const sendQonto = async (link, code, proxyconfig) => {

  try {
    const resp = await axios({

      headers: {
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',

      },

      method: 'POST',
      timeout: 10000,
      url: link,
      proxy: proxyconfig,
      data: qs.stringify({
        'action': '',
        'mdp': code,
        'next': 'SUIVANT'
      })

    });


    return resp.data
  } catch (err) {
    return -1
  }

}

async function registerfirst(info, proxy, numero) {

  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password
      }
    }
  } else {
    proxyconfig = null
  }

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888'
  }

  const srp = new SRPClient("nyu5Glqkw")
  yolo = srp.calculateA()
  duplicate = ''
  duplicate = await getSession(info, yolo, proxyconfig)
  if (duplicate == 0) return 0
  info.num = "+336" + Math.floor((Math.random() * 90000000) + 10000000)
  data = await getAmazonToken(proxyconfig)
  if (data == -1) return -1
  ip = await getIP(proxyconfig)
  if (ip == -1) return -1
  while (ip == 0) {
    ip = await getIP(proxyconfig)
    if (ip == -1) return -1
  }
  info.ip = ip.ip

  sessionToken = data.Credentials.SessionToken
  accessKeyId = data.Credentials.AccessKeyId
  secretAccessKey = data.Credentials.SecretKey

  token = await getToken(secretAccessKey, accessKeyId, sessionToken, proxyconfig)

  if (token == -1) return -1
  token = token.token

  data = await confirm(info, token, proxyconfig)

  if (data == 0 || data == -1) {
    return data
  }
  info.payment_method = data.payment_method
  info.token = data.id
  bigToken = data.next_action.use_stripe_sdk.stripe_js.split('/')[5]

  clientSecret = bigToken.split("&")[0].split('=')[1]

  data = await getPareq(bigToken, proxyconfig)
  if (!data.includes("Authentification terminé")) {
    if (data == -1) return -1
    pareq = data.split('value="')[1].split('"')[0]
    linkStripe = data.split('value="')[2].split('"')[0]
    linkForm = data.split('action="')[1].split('"')[0]



    // try {
    //   soundTrigger.play(filePath).then((response) => console.log("done"));
    //  console.log(response)
    // } catch (e) {
    //   console.log(e)
    // }



    if (data.split('method="POST" action="')[1].includes('-acs.marqeta.co')) {

      data = await getForm(pareq, linkForm, linkStripe, proxyconfig)
      if (data == -1) return -1

      try {
        newUrl = data.split('m" action=')[1].split('"')[1]
      } catch (e) {
        console.log(colors.brightRed(`[Error][${numero}][${info.Email}] Problem with Lydia Card`))
        return 0
      }
      shortCode = data.split('programShortCode"')[1].split('"')[1]
      newPareq = data.split('pareqToken"')[1].split('"')[1]

      console.log(chalk.rgb(247, 158, 2)("\n[Info] Lydia Menu (Choose what you received)"))
      console.log(" 1. SMS Code (old version)")
      console.log(" 2. Press the button (new version)\n")


      input = inputReader.readInteger()
      while (true) {
        if (input == 1 || input == 2) {
          break
        }
        input = inputReader.readInteger()
      }

      if (input == 1) {
        console.log("[Info][" + numero + "][" + info.Email + "] 3DSecure Sms code : ")
        input = inputReader.readLine()

        data = await sendForm(newUrl, shortCode, newPareq, linkStripe, input, proxyconfig)
        if (data == -1) return -1

        error = data.includes('Le code de vérification n’est pas correct')
        while (error) {
          console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Incorrect verification code, a new one was sent"))
          console.log("[Lydia][" + numero + "][" + info.Email + "] 3DSecure Sms code : ")
          input = inputReader.readLine()
          data = await sendForm(newUrl, shortCode, newPareq, linkStripe, input, proxyconfig)
          if (data == -1) return -1

          await sleep(1000)
          error = data.includes('Le code de vérification n’est pas correct')
        }
        console.log(colors.green("[Lydia][" + numero + "][" + info.Email + "] SMS Code successfully added"))
      } else {
        console.log("[Lydia][" + numero + "][" + info.Email + "] Press enter when you confirm on Lydia App : ")
        input = inputReader.readLine()
        data = await sendForm(newUrl, "lyda", newPareq, linkStripe, undefined, proxyconfig)
        if (data == -1) return -1

        while (data.includes('"PaRes" value=""')) {
          console.log("[Lydia][" + numero + "][" + info.Email + "] Press enter when you confirm on Lydia App : ")
          input = inputReader.readLine()
          data = await sendForm(newUrl, "lyda", newPareq, linkStripe, undefined, proxyconfig)
          if (data == -1) return -1

        }
        if (data == -1) return -1
        console.log(colors.green("[Lydia][" + numero + "][" + info.Email + "] 3DS successfully confirmed"))
      }
      pares = data.split('="PaRes" value="')[1].split('"')[0]

      await redirect3DS(pares, linkStripe, proxyconfig)

    } else if (data.split('method="POST" action="')[1].includes('touchtechpayments.com')) {


      if (info.revo.revoTask == "") {
        console.log("\n[Info] Revolut Menu (The settings will be saved for the next tasks)")
        console.log("1. Press enter when you confirm")
        console.log("2. Auto confirm with delay")


        input = inputReader.readInteger()
        while (true) {
          if (input == 1 || input == 2) {
            break
          }
          input = inputReader.readInteger()
        }

        if (input == 1) {
          info.revo.revoTask = 1
          info.revo.revoDelay = 0
        }

        if (input == 2) {
          info.revo.revoTask = 2
          console.log("[Info] Delay ? (s)")
          input = inputReader.readInteger()
          while (true) {
            if (input != 0) {
              break
            }
            input = inputReader.readInteger()
          }
          info.revo.revoDelay = input * 1000
        }
      }
      data = await getRevolutForm(pareq, linkStripe, proxyconfig)
      if (data == -1) return -1
      transToken = data.split('config.transaction = {')[1].split('"')[1]
      if (info.revo.revoTask == 1) {
        console.log("[Revolut][" + numero + "][" + info.Email + "] Press enter when you confirm on Revolut App : ")
        input = inputReader.readLine()
        data = await sendRevolutForm(transToken, proxyconfig)
        if (data == -1) return -1
        while (data.status.includes("pending")) {
          console.log("[Revolut][" + numero + "][" + info.Email + "] Press enter when you confirm on Revolut App : ")
          input = inputReader.readLine()
          data = await sendRevolutForm(transToken, proxyconfig)
          if (data == -1) return -1
        }
      }

      if (info.revo.revoTask == 2) {
        console.log("[Revolut][" + numero + "][" + info.Email + "] Auto confirm mode")
        await sleep(2000)
        console.log("[Revolut][" + numero + "][" + info.Email + "] Wait " + info.revo.revoDelay / 1000 + "s")
        await sleep(info.revo.revoDelay)
        data = await sendRevolutForm(transToken, proxyconfig)
        if (data == -1) return -1

        while (data.status.includes("pending")) {
          console.log("[Revolut][" + numero + "][" + info.Email + "] Wait " + info.revo.revoDelay / 1000 + "s")
          await sleep(info.revo.revoDelay)
          data = await sendRevolutForm(transToken, proxyconfig)
        }
      }
      console.log(colors.green("[Revolut][" + numero + "][" + info.Email + "] 3DS successfully confirmed"))
      authToken = data.authToken
      data = await confirmRevolutForm(transToken, authToken, proxyconfig)
      if (data == -1) return -1

      pares = data.Response
      data = await RevolutRedirect3DS(pareq, linkStripe, proxyconfig)
      if (data == -1) return -1

      merchant = data.split('merchant" value="')[1].split('"')[0]
      threeds = data.split('three_d_secure" value="')[1].split('"')[0]
      await confirmRevolut3DS(pares, merchant, threeds, proxyconfig)
    } else if (data.includes("3dsecure.monext.fr")) {

      cookiesQonto = await getSessionQonto(pareq, linkStripe, proxyconfig)

      link = cookiesQonto.split('<form action="')[1].split('"')[0]
      await getQonto(link, proxyconfig)


      console.log("[Qonto][Info][" + numero + "][" + info.Email + "] 3DSecure Sms code : ")
      input = inputReader.readLine()
      data = await sendQonto(link, input, proxyconfig)
      if (data == -1) return -1

      while (data.includes('Le code saisi est incorrect') || data.includes('Le code est obligatoire')) {
        console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Incorrect verification code, a new one was sent"))
        console.log("[Qonto][" + numero + "][" + info.Email + "] 3DSecure Sms code : ")
        input = inputReader.readLine()
        data = await sendQonto(link, input, proxyconfig)
        if (data == -1) return -1
      }
      console.log(colors.green("[Qonto][" + numero + "][" + info.Email + "] SMS Code successfully added"))

    } else {
      console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Provider unknown, open a ticket"))
      return 0
    }
  }else{
    console.log(colors.green("[Qonto][" + numero + "][" + info.Email + "] SMS Code successfully added (3DS not required for this card)"))
  }
  return info

}

module.exports = {
  registerfirst,
  getRaffleData,
  getRaffleId
}