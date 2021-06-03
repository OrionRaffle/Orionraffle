const axios = require('axios-https-proxy-fix')
const Captcha = require('2captcha')
const randomstring = require('randomstring')
const {
  SRPClient,
  calculateSignature,
  getNowString,
} = require('amazon-user-pool-srp-client')
const inputReader = require('wait-console-input')
const aws4 = require('aws4')
const chalk = require('chalk');

const colors = require('colors')
const qs = require('qs')
// const path = require("path");
// const soundTrigger = require("sound-play");
// const filePath = path.join(__dirname, "../ding.mp3");




function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const getSession = async (info, yolo, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        Connection: 'keep-alive',
      },
      method: 'POST',
      timeout: 10000,
      url: 'https://cognito-idp.us-east-1.amazonaws.com/',
      data: {
        AuthFlow: 'USER_SRP_AUTH',
        ClientId: '165cbvf0gsromjvtdeor72t0pj',
        AuthParameters: { USERNAME: info.Email.toLowerCase(), SRP_A: yolo },
        ClientMetadata: {},
      },
      proxy: proxyconfig,
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
      if (err.response.data.message.includes('User does not exist')) {
        console.log(colors.brightRed(`[Error][${info.Email}] Account doesn't exist`))
        return 0
      }
    } catch (e) { }

    return -1
  }
}
const getAccessToken = async (userid, secretblock, timestamp, signature, proxyconfig, info) => {
  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target':
          'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
        Connection: 'keep-alive',
      },
      method: 'POST',
      timeout: 10000,
      url: 'https://cognito-idp.us-east-1.amazonaws.com/',
      data: {
        ChallengeName: 'PASSWORD_VERIFIER',
        ClientId: '165cbvf0gsromjvtdeor72t0pj',
        ChallengeResponses: {
          USERNAME: userid,
          PASSWORD_CLAIM_SECRET_BLOCK: secretblock,
          TIMESTAMP: timestamp,
          PASSWORD_CLAIM_SIGNATURE: signature,
        },
        ClientMetadata: {},
      },
      proxy: proxyconfig,
    })

    return resp.data
  } catch (err) {
    try {
      if (err.response.data.message.includes("Incorrect username")) {
        console.log(colors.brightRed(`[Error][${info.Email}] Incorrect Password`))
        return 0
      }
    } catch (err) { }
    return -1
  }
}

const getIdentityId = async (idToken, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityService.GetId',
        Connection: 'keep-alive',
      },
      method: 'POST',
      timeout: 10000,
      url: 'https://cognito-identity.us-east-1.amazonaws.com/',
      data: {
        IdentityPoolId: 'us-east-1:e97b1e70-cbae-4f6d-bc31-f0aa0a09d422',
        Logins: {
          'cognito-idp.us-east-1.amazonaws.com/us-east-1_nyu5Glqkw': idToken,
        },
      },
      proxy: proxyconfig,
    })

    return resp.data
  } catch (err) {
    return -1
  }
}
const getTokens = async (identityId, accessToken, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
        Connection: 'keep-alive',
      },
      method: 'POST',
      timeout: 10000,
      url: 'https://cognito-identity.us-east-1.amazonaws.com/',
      data: {
        IdentityId: identityId,
        Logins: {
          'cognito-idp.us-east-1.amazonaws.com/us-east-1_nyu5Glqkw': accessToken,
        },
      },
      proxy: proxyconfig,
    })

    return resp.data
  } catch (err) {
    return -1
  }
}
const stripeOptions = async (proxyconfig) => {
  try {
    const resp = await axios({
      method: 'OPTIONS',
      url:
        'http://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/payment/token',
      proxy: proxyconfig,
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        Connection: 'keep-alive',
        'access-control-request-headers':
          'authorization,x-amz-date,x-amz-security-token',
        'accept-language': 'fr-fr',
        'access-control-request-method': 'OPTIONS',
      },
    })
  } catch (err) {
    return -1
  }
}

const userOptions = async (userid, proxyconfig) => {
  try {
    const resp = await axios({
      method: 'OPTIONS',
      url: `http://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/user?cid=${userid}`,
      proxy: proxyconfig,
      timeout: 10000,

      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        Connection: 'keep-alive',
        'access-control-request-headers': 'authorization',
        'access-control-request-method': 'GET',
      },
    })
  } catch (err) {
    return -1
  }
}
const getStripeToken = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  proxyconfig
) => {
  const request = {
    host: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
    method: 'GET',
    url: `https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/payment/token`,
    proxy: proxyconfig,
    timeout: 10000,

    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
      'content-type': 'application/json',
      Connection: 'keep-alive',
      'accept-encoding': 'gzip, deflate, br',
      accept: 'application/json, text/plain, */*',
      authority: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
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
    return -1
  }
}

const getInfoUser = async (userid, idToken, proxyconfig, info) => {
  try {
    const resp = await axios({
      host: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
      method: 'GET',
      url: `https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/user?cid=${userid}`,
      path: `/v1/user?cid=${userid}`,
      proxy: proxyconfig,
      timeout: 10000,

      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        Connection: 'keep-alive',
        authorization: `Bearer ${idToken}`,
      },
    })

    return resp.data
  } catch (err) {
    try {
      if (err.response.data.error.includes("INVALID_INPUT")) {
        console.log(colors.brightRed(`[Error][${info.Email}] The account is dead (It is unusable)`))
        return 0
      }
    } catch (err) {
      return -1
    }
  }
}
// Function Stripe

const confirm = async (info, token, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        accept: 'application/json',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'fr,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://js.stripe.com',
        referer: 'https://js.stripe.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
      },
      method: 'post',
      url: `https://api.stripe.com/v1/setup_intents/seti_${token.split('_')[1]
        }/confirm`,
      timeout: 10000,

      data: qs.stringify({
        'payment_method_data[type]': 'card',
        'payment_method_data[billing_details][address][city]': info.City,
        'payment_method_data[billing_details][address][country]': info.Country.trim(),
        'payment_method_data[billing_details][address][line1]': info.Address,
        'payment_method_data[billing_details][address][line2]': info.Address2,
        'payment_method_data[billing_details][address][postal_code]': info.PostalCode.trim(),
        'payment_method_data[billing_details][address][state]': info.State,
        'payment_method_data[billing_details][email]': info.Email,
        'payment_method_data[billing_details][name]': `${info.FirstName} ${info.LastName}`,
        'payment_method_data[billing_details][phone]': info.num,
        'payment_method_data[card][number]': info.CardNumber.trim(),
        'payment_method_data[card][cvc]': info.CVC.trim(),
        'payment_method_data[card][exp_month]': info.MM.trim(),
        'payment_method_data[card][exp_year]': info.YY.trim(),
        'payment_method_data[payment_user_agent]':
          'stripe.js/c1e7aeb75; stripe-js-v3/c1e7aeb75',
        'payment_method_data[referrer]': 'https://www.sneakql.com/',
        expected_payment_method_type: 'card',
        use_stripe_sdk: 'false',
        webauthn_uvpa_available: 'true',
        spc_eligible: 'false',
        key: 'pk_live_PhPgbLR5ua2fiuhEPVL4x32H00rsE8tmce',
        client_secret: token,
      }),
    })

    return resp.data
  } catch (err) {
    console.log(err)
    if (err.response.data.error.type.includes('card_error')) {
      console.log(colors.brightRed(`[Error][${info.Email}] CC invalid`))
      return 0
    }
  }
}
const getPareq = async (bigToken, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'GET',
      timeout: 10000,

      url: `https://hooks.stripe.com/redirect/authenticate/${bigToken}`,
      proxy: proxyconfig,
    })

    return resp.data
  } catch (err) {
    return -1
  }
}
const getForm = async (pareq, linkForm, linkStripe, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'POST',
      url: linkForm,
      timeout: 10000,
      proxy: proxyconfig,
      data: qs.stringify({
        PaReq: pareq,
        TermUrl: linkStripe,
        MD: '',
      }),
    })

    return resp.data
  } catch (err) {
    return -1
  }
}

const sendForm = async (
  newUrl,
  shortCode,
  newPareq,
  linkStripe,
  code,
  proxyconfig
) => {
  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'POST',
      url: `https://authentication-acs.marqeta.com${newUrl}`,
      proxy: proxyconfig,
      timeout: 10000,
      data: qs.stringify({
        MD: '',
        PaRes: '',
        otp_attempt_counter_after_kba: '0',
        is_kba_completed: 'false',
        pareqToken: newPareq,
        programShortCode: shortCode,
        termUrl: linkStripe,
        oneTimePasscode: code,
      }),
    })

    return resp.data
  } catch (err) {
    return -1
  }
}



const redirect3DS = async (pares, linkStripe, proxyconfig) => {
  merchant = linkStripe.split('/')[5]

  secure = linkStripe.split('/')[6].replace(/%20/g, '')

  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'POST',
      url: `https://hooks.stripe.com/3d_secure/complete/${merchant}/${secure}`,
      proxy: proxyconfig,
      timeout: 10000,
      data: qs.stringify({
        MD: '',
        PaRes: pares,
        splat: '[]',
        captures: `["${merchant}","${secure}"]`,
        merchant,
        three_d_secure: secure,
      }),
    })

    return resp.data
  } catch (err) {
    return -1
  }
}

async function hcaptcha(key) {
  const solver = new Captcha.Solver(key)

  await solver
    .recaptcha(
      '6LcEQb0UAAAAAFluVqTQqxfo1T9f7SM7jycCZBET',
      'https://www.sneakql.com/'
    )
    .then((res) => {
      r = res.data
    })
  return r
}
const getIP = async (proxyconfig) => {
  try {
    const resp = await axios({
      method: 'get',
      url: 'https://api.ipify.org?format=json',
      proxy: proxyconfig,
      timeout: 10000,
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
    } catch (e) { }
    return 0
  }



}
const newEntry = async (info, key, tokenId, proxyconfig) => {
  captcha = await hcaptcha(key)
  await entryOptions()
  fingerprint = randomstring.generate({
    length: 32,
    charset: 'hex',
  })

  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        Connection: 'keep-alive',
        authorization: `Bearer ${tokenId}`,
      },
      method: 'POST',
      proxy: proxyconfig,
      timeout: 10000,
      url:
        'https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/new',
      data: {
        clientMetadata: {
          browserFingerprint: fingerprint,
          drawId: info.IdRaffle,
          locale: 'fr-FR',
          timezone: 'Europe/Paris',
          userAgent:
            'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
          birthdate: info.birthday,
          email: info.Email.trim(),
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
          postcode: '46788',
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
          setupIntentID: info.token,
        },
        cognitoID: info.cognitoId,
        consumerID: info.consumerId,
      },
    })

    return resp.data
  } catch (err) {
    if (err.response.data.error.includes('OPEN_ENTRY_EXISTS'))
      console.log(colors.brightRed(`[Error][${info.Email}] You have already entered the draw`))

    return 0
  }
}
const entryOptions = async (proxyconfig) => {
  try {
    const resp = await axios({
      method: 'OPTIONS',
      url:
        'https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/new',
      proxy: proxyconfig,
      timeout: 10000,
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

const confirmEntryOptions = async (userid, proxyconfig) => {
  try {
    const resp = await axios({
      method: 'OPTIONS',
      url: `https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/confirm?cid=${userid}`,
      proxy: proxyconfig,
      timeout: 10000,
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
const confirmNewEntry = async (userid, tokenId, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',

        Connection: 'keep-alive',
        authorization: `Bearer ${tokenId}`,
      },
      method: 'POST',
      proxy: proxyconfig,
      url: `https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/confirm?cid=${userid}`,
    })

    return resp.data
  } catch (err) {
    return 0
  }
}
const RevolutRedirect3DS = async (pares, linkStripe, proxyconfig) => {
  merchant = linkStripe.split('/')[5]

  secure = linkStripe.split('/')[6].replace(/%20/g, '')

  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'POST',
      url: `https://hooks.stripe.com/three_d_secure/redirect_complete/${merchant}/${secure}`,
      proxy: proxyconfig,
      timeout: 10000,
      data: qs.stringify({
        MD: '',
        PaRes: pares,
      }),
    })

    return resp.data
  } catch (err) {
    return -1
  }
}

const confirmRevolut3DS = async (pares, merchant, secure, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'POST',
      url: `https://hooks.stripe.com/3d_secure/complete/${merchant}/${secure}`,
      proxy: proxyconfig,
      timeout: 10000,
      data: qs.stringify({
        MD: '',
        PaRes: pares,
        splat: '[]',
        captures: `["${merchant}","${secure}"]`,
        merchant,
        three_d_secure: secure,
      }),
    })

    return resp.data
  } catch (err) {
    return -1
  }
}
const sendRevolutForm = async (token, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'POST',
      url: 'https://poll.touchtechpayments.com/poll',
      proxy: proxyconfig,
      timeout: 10000,
      data: {
        transToken: token,
      },
    })

    return resp.data
  } catch (err) {
    return -1
  }
}
const getRevolutForm = async (pareq, linkStripe, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'POST',
      url: 'https://idcheck.acs.touchtechpayments.com/v1/payerAuthentication',
      proxy: proxyconfig,
      timeout: 10000,
      data: qs.stringify({
        PaReq: pareq,
        TermUrl: linkStripe,
        MD: '',
      }),
    })

    return resp.data
  } catch (err) {
    return -1
  }
}
const confirmRevolutForm = async (transToken, authToken, proxyconfig) => {
  try {
    const resp = await axios({
      headers: {
        Connection: 'keep-alive',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
      },

      method: 'POST',
      url: 'https://macs.touchtechpayments.com/v1/confirmTransaction',
      proxy: proxyconfig,
      timeout: 10000,
      data: {
        transToken,
        authToken,
      },
    })

    return resp.data
  } catch (err) {
    return -1
  }
}

const getSessionQonto= async (pareq, linkStripe, proxyconfig) => {

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
        'action':'submit',
        'submit'	:'SUIVANT'
      })

    });


  
  } catch (err) {
    return -1
  }

}
const sendQonto = async (link,code, proxyconfig) => {

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
        'action' :'',
        'mdp': code,
        'next':'SUIVANT'
      })


    });


    return resp.data
  } catch (err) {
    return -1
  }

}
async function loginfirst(info, numero, proxy ) {
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

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888'
  }

  // BackEnd AWS
  const srp = new SRPClient('nyu5Glqkw')
  yolo = srp.calculateA()


  // await authOptions()


  data = await getSession(info, yolo, proxyconfig)

  if (data == 0 || data == -1) return data 
  userid = data.ChallengeParameters.USER_ID_FOR_SRP
  ip = await getIP(proxyconfig)

  if (ip == -1) return -1
  while (ip == 0) {
    ip = await getIP(proxyconfig)
  }
  info.ip = ip.ip

  const dateNow = getNowString()

  const hkdf = srp.getPasswordAuthenticationKey(
    data.ChallengeParameters.USER_ID_FOR_SRP,
    info.Password,
    data.ChallengeParameters.SRP_B,
    data.ChallengeParameters.SALT
  )
  const signatureString = calculateSignature(
    hkdf,
    'nyu5Glqkw',
    data.ChallengeParameters.USER_ID_FOR_SRP,
    data.ChallengeParameters.SECRET_BLOCK,
    dateNow
  )

  data2 = await getAccessToken(data.ChallengeParameters.USER_ID_FOR_SRP, data.ChallengeParameters.SECRET_BLOCK, dateNow, signatureString, proxyconfig, info)
  if (data2 == 0 || data2 == -1) return data2
  accessToken = data2.AuthenticationResult.AccessToken
  idToken = data2.AuthenticationResult.IdToken

  data3 = await getIdentityId(idToken, proxyconfig)
  if (data3 == -1) return -1
  identityId = data3.IdentityId

  data4 = await getTokens(identityId, idToken, proxyconfig)
  if (data4 == -1) return data4
  accessKeyId = data4.Credentials.AccessKeyId
  sessionToken = data4.Credentials.SessionToken
  secretKey = data4.Credentials.SecretKey

  await userOptions(userid, proxyconfig)
  dataUser = await getInfoUser(userid, idToken, proxyconfig, info)
  if (dataUser == 0 || dataUser == -1) return dataUser
  info.num = dataUser.Consumer.phone


  info.birthday = dataUser.Consumer.birthdate
  info.cognitoId = dataUser.Consumer.cognitoID
  info.consumerId = dataUser.Consumer.id

  // Front raffle (stripe)
  await stripeOptions(proxyconfig)
  token = await getStripeToken(
    accessKeyId,
    secretKey,
    sessionToken,
    proxyconfig
  )
  if (token == -1) return -1
  token = token.token

  data5 = await confirm(info, token, proxyconfig)
  if (data5 === 0) {
    return 0
  }

  info.payment_method = data5.payment_method
  info.token = data5.id

  bigToken = data5.next_action.use_stripe_sdk.stripe_js.split('/')[5]
  clientSecret = bigToken.split('&')[0].split('=')[1]

  data6 = await getPareq(bigToken, proxyconfig)
  if (data6 == -1) return -1
  if (data6.includes('Authentification terminé')) {
    console.log(colors.green(`[Info][${numero}][${info.Email}] 3DS successfully confirmed`))
  } else {
    pareq = data6.split('value="')[1].split('"')[0]
    linkStripe = data6.split('value="')[2].split('"')[0]
    linkForm = data6.split('action="')[1].split('"')[0]

    
    // if (sound) {
      
    //   try {
    //     soundTrigger.play(filePath);
    //   } catch (e) {
  
    //   }
    // }
  
    
    if (data6.split('method="POST" action="')[1].includes('-acs.marqeta.co')) {

      data7 = await getForm(pareq, linkForm, linkStripe, proxyconfig)
      try {
        newUrl = data7.split('m" action=')[1].split('"')[1]
      } catch (e) {
        console.log(colors.brightRed(`[Error][${numero}][${info.Email}] Problem with Lydia Card`))
        return 0
      }
      shortCode = data7.split('programShortCode"')[1].split('"')[1]
      newPareq = data7.split('pareqToken"')[1].split('"')[1]

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
        console.log(colors.green(`[Lydia][${numero}][${info.Email}] 3DSecure Sms code : `))
        input = inputReader.readLine()

        data8 = await sendForm(newUrl, shortCode, newPareq, linkStripe, input, proxyconfig)
        error = data8.includes('Le code de vérification n’est pas correct')
        while (error) {
          console.log(colors.brightRed(`[Error][${numero}][${info.Email}] Incorrect verification code, a new one was sent`))
          console.log(colors.green(`[Lydia][${numero}][${info.Email}] 3DSecure Sms code : `))
          input = inputReader.readLine()
          data8 = await sendForm(newUrl, shortCode, newPareq, linkStripe, input, proxyconfig)
          await sleep(1000)
          error = data8.includes('Le code de vérification n’est pas correct')
        }
        console.log(colors.green(`[Lydia][${numero}][${info.Email}] SMS Code successfully added`))
      } else {
        console.log("[Lydia][" + numero + "][" + info.Email + "] Press enter when you confirm on Lydia App : ")
        input = inputReader.readLine()
        data8 = await sendForm(newUrl, 'lyda', newPareq, linkStripe, undefined, proxyconfig)
        while (data8.includes('"PaRes" value=""')) {
          console.log("[Lydia][" + numero + "][" + info.Email + "] Press enter when you confirm on Lydia App : ")
          input = inputReader.readLine()
          data8 = await sendForm(newUrl, 'lyda', newPareq, linkStripe, undefined, proxyconfig)
          if (data8 == -1) return -1
        }
        if (data8 == -1) return -1
        console.log(colors.green("[Lydia][" + numero + "][" + info.Email + "] 3DS successfully confirmed"))
      }
      pares = data8.split('="PaRes" value="')[1].split('"')[0]

      await redirect3DS(pares, linkStripe, proxyconfig)
    } else if (data6.split('method="POST" action="')[1].includes('touchtechpayments.com')) {

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
        if (data == -1) return data
        while (data.status.includes("pending")) {
          console.log("[Revolut][" + numero + "][" + info.Email + "] Press enter when you confirm on Revolut App : ")
          input = inputReader.readLine()
          data = await sendRevolutForm(transToken, proxyconfig)
          if (data == -1) return data
        }
      }
      if (info.revo.revoTask == 2) {
        console.log("[Revolut][" + numero + "][" + info.Email + "] Auto confirm mode")
        await sleep(2000)
        console.log("[Revolut][" + numero + "][" + info.Email + "] Wait " + info.revo.revoDelay / 1000 + "s")
        await sleep(info.revo.revoDelay)
        data = await sendRevolutForm(transToken, proxyconfig)
        if (data == -1) return data
        while (data.status.includes("pending")) {
          console.log("[Revolut][" + numero + "][" + info.Email + "] Wait " + info.revo.revoDelay / 1000 + "s")
          await sleep(info.revo.revoDelay)
          data = await sendRevolutForm(transToken, proxyconfig)
          if (data == -1) return data
        }
      }


      console.log(
        colors.green(
          `[Info][${numero}][${info.Email}] 3DS successfully confirmed`
        )
      )
      authToken = data.authToken
      data = await confirmRevolutForm(transToken, authToken, proxyconfig)
      pares = data.Response
      data = await RevolutRedirect3DS(pareq, linkStripe, proxyconfig)
      merchant = data.split('merchant" value="')[1].split('"')[0]
      threeds = data.split('three_d_secure" value="')[1].split('"')[0]

      await confirmRevolut3DS(pares, merchant, threeds, proxyconfig)
    } else if (data6.includes("3dsecure.monext.fr")) {

      cookiesQonto = await getSessionQonto(pareq, linkStripe, proxyconfig)

      link = cookiesQonto.split('<form action="')[1].split('"')[0]
      await getQonto(link, proxyconfig)


      console.log("[Qonto][Info][" + numero + "][" + info.Email + "] 3DSecure Sms code : ")
      input = inputReader.readLine()
      data = await sendForm(link, input, proxyconfig)
      if (data == -1) return -1

      while (data.includes('Le code saisi est incorrect') || data.includes('Le code est obligatoire')) {
        console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Incorrect verification code, a new one was sent"))
        console.log("[Qonto][" + numero + "][" + info.Email + "] 3DSecure Sms code : ")
        input = inputReader.readLine()
        data = await sendForm(link, input, proxyconfig)
        if (data == -1) return -1
      }
      console.log(colors.green("[Qonto][" + numero + "][" + info.Email + "] SMS Code successfully added"))

    }else{
      console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Bank Provider unknown, open a ticket"))
      return 0
    }
  }

  // Backend AWS confirmation entry
  info.userSub = userid
  info.tokenId = idToken



  return info
}

module.exports = {
  loginfirst,

}
