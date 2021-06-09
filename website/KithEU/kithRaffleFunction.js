const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const Captcha = require("2captcha")
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const request = require('request-promise').defaults({
  jar: true
});
var randomstring = require("randomstring");
const https = require('https')
const fetch = require('node-fetch');

const chunkedRequest = require('chunked-request');
const { test } = require('uuid-random');

var HttpsProxyAgent = require('https-proxy-agent');


process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const charlesProxyconfig = {
  host: '127.0.0.1',
  port: '8888',
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function captcha(callback) {
  console.log('TRYING TO SOLVE RECAPCHAT')
  // A new 'solver' instance with our API key
  const solver = new Captcha.Solver("18fd783e9ec10c948ecc7b259c5fc92e")

  /* Example ReCaptcha Website */
  solver.hcaptcha("5d390af4-7556-44d7-b77d-2a4ade3ee3b2", "https://eu.kith.com/")

    .then((res) => {
      console.log('solved')
      callback(res)
    })
}

const kithEntry1 = async () => {


  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        "Accept": "*/*",
        "Accept-Language": "fr-fr",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'Content-Type': 'application/x-www-form-urlencoded',
        'referer': 'https://eu.kith.com/pages/kith-drawing-3-4?t=' + Date.now()

      },
      proxy: charlesProxyconfig,
      withCredentials: true,
      method: 'POST',
      url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&VER=8&RID=${getRandomIntInclusive(1000, 99999)}&CVER=22&X-HTTP-Session-Id=gsessionid&%24httpHeaders=X-Goog-Api-Client%3Agl-js%2F%20fire%2F7.23.0%0D%0AContent-Type%3Atext%2Fplain%0D%0A&zx=${randomstring.generate(11).toLowerCase()}&t=1`,
      data: qs.stringify({
        'count': '1',
        'ofs': '0',
        'req0___data__': '{"database": "projects/launches-by-seed/databases/(default)" }'
      })
    })




    return resp
  } catch (err) {


    return 0

  }

}



const kithEntry2 = async (sid, gsession, captcha) => {
  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  const headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
    "Accept": "*/*",
    "Accept-Language": "fr-FR,fr;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",

    'origin': 'https://eu.kith.com',
    'referer': 'https://eu.kith.com/pages/kith-drawing-3-4?t=' + Date.now()

  }

  var myInit = {
    method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default',
    agent: new HttpsProxyAgent('http://127.0.0.1:8888/')
  };

  var chunkedUrl = `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&gsessionid=${gsession}&VER=8&RID=rpc&SID=${sid}&CI=0&AID=0&TYPE=xmlhttp&zx=${randomstring.generate(11).toLowerCase()}&t=1`;
  fetch(chunkedUrl, myInit).then(response => response.body)
    .then(res => res.on('readable', () => {
      try {
        const result = chunkParser(res.read().toString());
      if (result !== null) handleChunk(result, sid, gsession, captcha);
      } catch (error) {
        console.log('error')
      }
    }))
}

function chunkParser(chunkString) {
  var streamToken1 = undefined
  var streamToken2 = undefined
  var streamToken3 = undefined

  chunkString = chunkString.replace(/\s/g, '').replace(/\r?\n|\r/g, '');

  if (chunkString.indexOf("[") === -1) {
    console.log(chunkString)
    return null
  }
  chunkString = chunkString.substring(chunkString.indexOf("["));
  chunkString = JSON.parse(chunkString);

  streamToken1 = chunkString[0][1][0].streamToken

  return {
    token1: streamToken1,
    token2: streamToken2,
    token3: streamToken3
  };
}

async function handleChunk(chunk, sid, gsession, captcha) {
  console.log(chunk)
  if (chunk.token3 !== undefined) {

  }
  else if (chunk.token2 !== undefined) {

  }
  else if (chunk.token1 !== undefined) {
    kithEntry3(sid, gsession, chunk.token1, captcha)
  }
}

const kithEntry3 = async (sid, gsession, token, captcha) => {
  dataR = raffleDataBuilder(token, captcha)
  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        "Accept": "*/*",
        "Accept-Language": "fr-FR,fr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'origin': 'https://eu.kith.com',
        'referer': 'https://eu.kith.com/pages/kith-drawing-3-4?t=' + Date.now()

      },
      proxy: charlesProxyconfig,
      withCredentials: true,
      method: 'POST',
      data: qs.stringify({
        'count': '1',
        'ofs': '0',
        'req0___data__': dataR
      }),

      url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&gsessionid=${gsession}&VER=8&RID=41250&SID=${sid}&AID=1&zx=${randomstring.generate(11).toLowerCase()}&t=1`,
          //https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&VER=8&gsessionid=_lZhYCGc2tufpcvnqRGelW68WIe7SQ73l3rwmSIZ2Og&SID=FYL0bRAPg-kpCqcHyVkHKg&RID=41250&AID=1&zx=i987j0qty0qo&t=1
    })


    return resp
  } catch (err) {


    return 0

  }

}

async function kithraffle() {
  dataKith1 = await kithEntry1()

  sid = dataKith1.data.split('","')[1].split('"')[0]
  gsession = dataKith1.headers['x-http-session-id']
  console.log(sid)
  console.log(gsession)

  //captcha(hithnext)
  hithnext('tt')

  async function hithnext(captcha) {
    console.log(captcha)
    dataKith2 = await kithEntry2(sid, gsession, captcha)
  }
  


  //await kithEntry3(sid, gsession)
  // dataKith2 = await kithEntry2(sid, gsession)


  // dataKith2 = await kithEntry2(sid, gsession)

}

kithraffle()

module.exports = {
  kithraffle
}

function raffleDataBuilder(token, solvedCaptcha) {
  var json = {
    "streamToken": token,
    "writes": [
      {
        "update": {
          "name": "projects/launches-by-seed/databases/(default)/documents/submissions/eBQau0tDQYx3kWbkumNy-5133309116493",
          "fields": {
            "currentDate": {
              "stringValue": "2021-06-08T17:37:55+02:00"
            },
            "campaignId": {
              "stringValue": "eBQau0tDQYx3kWbkumNy"
            },
            "customerId": {
              "stringValue": "5133309116493"
            },
            "type": {
              "stringValue": ""
            },
            "size": {
              "stringValue": " 10 US"
            },
            "model": {
              "stringValue": "cgKaBwpn9U0HbKyuMlOP"
            },
            "modelName": {
              "stringValue": "Nike x Sacai Blazer Low - Medium Grey/Classic Green-White"
            },
            "location": {
              "stringValue": "vrdbTkKOYLu9g0l4HT1I"
            },
            "locationName": {
              "stringValue": "Kith EUROPE"
            },
            "email": {
              "stringValue": "bastien-bouge@hotmail.fr"
            },
            "phone": {
              "stringValue": "0613145663"
            },
            "firstName": {
              "stringValue": "Bastien"
            },
            "lastName": {
              "stringValue": "BougÃ©"
            },
            "zipCode": {
              "stringValue": "41200"
            },
            "customerObject": {
              "mapValue": {
                "fields": {
                  "currentDate": {
                    "stringValue": "2021-06-08T17:35:00.000-05:00"
                  },
                  "campaignId": {
                    "stringValue": "eBQau0tDQYx3kWbkumNy"
                  },
                  "accepts_marketing": {
                    "stringValue": "true"
                  },
                  "addresses": {
                    "arrayValue": {
                      "values": [
                        {
                          "mapValue": {
                            "fields": {
                              "address1": {
                                "stringValue": "24 Rue Des Cheminets "
                              },
                              "address2": {
                                "stringValue": ""
                              },
                              "city": {
                                "stringValue": "Romo"
                              },
                              "company": {
                                "stringValue": ""
                              },
                              "country": {
                                "stringValue": "France"
                              },
                              "country_code": {
                                "stringValue": "FR"
                              },
                              "first_name": {
                                "stringValue": "Bastien"
                              },
                              "id": {
                                "stringValue": "6327519510605"
                              },
                              "last_name": {
                                "stringValue": "Bouge"
                              },
                              "phone": {
                                "stringValue": "0613145663"
                              },
                              "province": {
                                "stringValue": ""
                              },
                              "province_code": {
                                "stringValue": ""
                              },
                              "street": {
                                "stringValue": "24 Rue Des Cheminets "
                              },
                              "zip": {
                                "stringValue": "41200"
                              }
                            }
                          }
                        }
                      ]
                    }
                  },
                  "addresses_count": {
                    "stringValue": "1"
                  },
                  "email": {
                    "stringValue": "bastien-bouge@hotmail.fr"
                  },
                  "first_name": {
                    "stringValue": "Bastien"
                  },
                  "has_account": {
                    "stringValue": "true"
                  },
                  "id": {
                    "stringValue": "5133309116493"
                  },
                  "last_name": {
                    "stringValue": "BougÃ©"
                  },
                  "last_order": {
                    "stringValue": ""
                  },
                  "name": {
                    "stringValue": "Bastien BougÃ©"
                  },
                  "orders_count": {
                    "stringValue": "0"
                  },
                  "phone": {
                    "stringValue": "0613145663"
                  },
                  "tags": {
                    "stringValue": ""
                  },
                  "tax_exempt": {
                    "stringValue": "false"
                  },
                  "total_spent": {
                    "stringValue": "0"
                  },
                  "country": {
                    "stringValue": "France"
                  },
                  "country_code": {
                    "stringValue": "FR"
                  },
                  "ip": {
                    "stringValue": "86.236.253.237"
                  }
                }
              }
            },
            "ip": {
              "stringValue": "86.236.253.237"
            },
            "processed": {
              "booleanValue": false
            },
            "mouseMoved": {
              "booleanValue": true
            },
            "customerMessage": {
              "stringValue": ""
            },
            "country": {
              "stringValue": "France"
            },
            "countryCode": {
              "stringValue": "FR"
            },
            "site": {
              "stringValue": "kith-europe.myshopify.com"
            },
            "risk": {
              "stringValue": "null"
            },
            "captchaToken": {
              "stringValue": solvedCaptcha
            },                //solve captcha
            "synced": {
              "booleanValue": false
            },
            "isSyncing": {
              "booleanValue": false
            },
            "ccZip": {
              "stringValue": "not-set"
            },
            "ccBrand": {
              "stringValue": "not-set"
            },
            "ccCountry": {
              "stringValue": "not-set"
            },
            "ccLast4": {
              "stringValue": "not-set"
            },
            "groupId": {
              "integerValue": "37"
            },
            "removeCustomerLogin": {
              "booleanValue": false
            },
            "emailOptIn": {
              "booleanValue": false
            },
            "secretCustomerId": {
              "stringValue": ""
            }
          }
        }
      }
    ]
  }
  return JSON.stringify(json)
}