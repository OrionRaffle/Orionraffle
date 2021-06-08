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



const kithEntry2 = async (sid, gsession) => {
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
        cache: 'default'
    };

    var chunkedUrl = `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&gsessionid=${gsession}&VER=8&RID=rpc&SID=${sid}&CI=0&AID=0&TYPE=xmlhttp&zx=${randomstring.generate(11).toLowerCase()}&t=1`;
    fetch(chunkedUrl, myInit).then(response => response.body)
        .then(res => res.on('readable', () => {
            let chunk;
            while (null !== (chunk = res.read())) {
                handleChunk(chunkParser(chunk.toString()));
            }
        }))
}

function chunkParser(chunkString) {
    console.log("START PARSER")
    chunkString = chunkString.replace(/\s/g,'').replace(/\r?\n|\r/g,'');
    console.log(chunkString)
    console.log(chunkString.indexOf("["))
    chunkString = chunkString.substring(chunkString.indexOf("["));
    console.log(chunkString)
    chunkString = JSON.parse(chunkString);
    console.log(chunkString)
    console.log("END PARSER")
    return chunkString;
}

async function handleChunk(chunk) {
    console.log()
    
}

const kithEntry3 = async (sid, gsession) => {

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
                'req0___data__': '{"database": "projects/launches-by-seed/databases/(default)" }'
            }),

            url: `https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel?database=projects%2Flaunches-by-seed%2Fdatabases%2F(default)&gsessionid=${gsession}&VER=8&RID=rpc&SID=${sid}&CI=0&AID=0&TYPE=xmlhttp&zx=${randomstring.generate(11).toLowerCase()}&t=1`,
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
    dataKith2 = await kithEntry2(sid, gsession)


    //await kithEntry3(sid, gsession)
    // dataKith2 = await kithEntry2(sid, gsession)


    // dataKith2 = await kithEntry2(sid, gsession)

}

kithraffle()

module.exports = {
    kithraffle
}


var jsonBody = {
    "streamToken": "GRBoQgKB9LW1",
    "writes": [
      {
        "update": {
          "name": "projects/launches-by-seed/databases/(default)/documents/submissions/mjpEwwUxOPtLzOXhfsGP-5139788791885",
          "fields": {
            "currentDate": {
              "stringValue": "2021-06-03T11:57:42+02:00"
            },
            "campaignId": {
              "stringValue": "mjpEwwUxOPtLzOXhfsGP"
            },
            "customerId": {
              "stringValue": "5139788791885"
            },
            "type": {
              "stringValue": ""
            },
            "size": {
              "stringValue": " 8.5 US"
            },
            "model": {
              "stringValue": "tpJkZYb7nbMUsrh3fCHx"
            },
            "modelName": {
              "stringValue": "EU ONLINE ONLY - NIKE Fragment x Nike Dunk High \"Beijing\""
            },
            "location": {
              "stringValue": "EawefUuXEMkFFKnwaYrk"
            },
            "locationName": {
              "stringValue": "Kith EUROPE"
            },
            "email": {
              "stringValue": "gregoire.delata@outlook.com"
            },
            "phone": {
              "stringValue": "0782723886"
            },
            "firstName": {
              "stringValue": "gregoire"
            },
            "lastName": {
              "stringValue": "delata"
            },
            "zipCode": {
              "stringValue": "09000"
            },
            "customerObject": {
              "mapValue": {
                "fields": {
                  "currentDate": {
                    "stringValue": "2021-06-03T11:57:00.000-05:00"
                  },
                  "campaignId": {
                    "stringValue": "mjpEwwUxOPtLzOXhfsGP"
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
                                "stringValue": "233 Pla de Rans"
                              },
                              "address2": {
                                "stringValue": ""
                              },
                              "city": {
                                "stringValue": "Brassac"
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
                                "stringValue": "gregoire"
                              },
                              "id": {
                                "stringValue": "6336794034253"
                              },
                              "last_name": {
                                "stringValue": "delata"
                              },
                              "phone": {
                                "stringValue": "0782723886"
                              },
                              "province": {
                                "stringValue": ""
                              },
                              "province_code": {
                                "stringValue": ""
                              },
                              "street": {
                                "stringValue": "233 Pla de Rans"
                              },
                              "zip": {
                                "stringValue": "09000"
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
                    "stringValue": "gregoire.delata@outlook.com"
                  },
                  "first_name": {
                    "stringValue": "gregoire"
                  },
                  "has_account": {
                    "stringValue": "true"
                  },
                  "id": {
                    "stringValue": "5139788791885"
                  },
                  "last_name": {
                    "stringValue": "delata"
                  },
                  "last_order": {
                    "stringValue": ""
                  },
                  "name": {
                    "stringValue": "gregoire delata"
                  },
                  "orders_count": {
                    "stringValue": "0"
                  },
                  "phone": {
                    "stringValue": "0782723886"
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
              "stringValue": "P0_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNza2V5IjoiQWZPTk92ZFpQc1hWaUZIWDl5L09MaDNFcHJZYjdUTDlubUZZMG56WS9JMUlhNmwvQnlOYXpkYjNUUUUrM2wyNTJ3WUJlTkQ0T1FrWGRnTk1LN0lTSUhxbCtYWGxMQVdUTUZyZDZCNVdZTExUazQwaitOODNsbHA5enNkUmEwazJlZ2orOEo3c0ZxOTZSMVhCY3BRS3cvRjYvd3VRZHIzNWpocjZSZnhBZHB0TjcyeXMzWTNKSld4d1dtU3k5K2paNVRWbXF3bnlkNXRHSTc3cDRvVTZadGNKTGdxMzN5UEx6WjZsSXJhUGFwOWJGZFdmZEowYzM1WGUzWlYvTS9xV3BzYjF5amZLZUo1NFF5OGRKVTNSVUprR2VZM3ZlMTJZNW41WVl2dFNOYzE3YVNUOUlGWWV1TDNTN1RrQkhxcFlvYklYRmV6L0huSHkydlJWT25tVnM4RHBhWHc0VWtKR1pZWU54Q3JkZXB4c1c0NC9rVWRqQ2grbndVYXd2UEFUbUEySGdxWEZCSzJpb0lWUUVGY3FMMXhXTlM2YXNDaDJCK2UwbUpUdVZ6TTJ2VnBFQnNKU0N6em9wL05WeFo2Rm9rMFk5ODhHNzJPK25mTi9WMTZMeCsyMjYzQ3h6eHpKUFBqaTFpQ1V4dmYwcnRUUTFsNmdYL3pmajNaWEdFTG9MckRIYmdhR25veXdiZWM3b1VpaE82V1laRUg3aGYyNUhQTllkU3dYYS9laUJ1WFEvUDFIVlFqTCtNTmduU2ZISlVnWjhTQzB1UmwzcTBRRDA1cVlxTDRUYU1GVXpaNkhuak1XR3lzcnFRUXZiOGNZWm9ZMVdpSi9ueURVTWJKT1dnZHl5U3FBNWI4Zmc5eEhiazd3aUQ5WHhBYnluK1Z0NWU5akNMTkhKZk5ra25uYXhWaFV3TWQ2UzVMUk9SUkJDWURZNk9Qa2toOWtxTWJXbzkwaU0zWkVOVUhqdE1aMTRZNzlzN1ZLYTFHdWdWUWdFMTFhKzVDMlFDRE55UDIyb01CL0g0aXUyTHRCVjlITS9hY09Xd0FLMVlHK0hKR0lKUHF5REo5ZkJWMDJaVTFaazJsdGI3RWNUb0orVmNNdEw2UWtwYWlBQkNScWFhMmFzY0xXL2laNEYvOERtS1VPckMwc2pzN083U0FmQ2lHY1psSWFzRnc0L0tzMFJUeThVOWc5L2dka2huOUNPdnJUU2NDYjdtTUFkZDhoZDNSUFduck44ZjBILzdaZHNqNkZIaXBCdkdPdU9mT2ZRSXVHSzBjalV3Z01Ra3hHZnRyQURXMHkrcDRKRGczYm1oMVoweWJJVjVKTENuY1NaS2pQSDBsMmRqYzgrK0hnU0I0aEV1MWNjZC84M1NYZ0dPRmh2TlltTVB2WWhSZXFTNGsrUW5GY0RZOUdoaHF3cnl4cCsxR0I3eHYvd2hUbkE5YVAzN0xzM3lmdjlpZFFzRk9CRzNENmczeDlrSHNLZEFNaFZDdjFOVStsTlRxNEwzc2NXRmVPVkNkYk5uQzl0NEJTa3lJZDdBV0ZVZExIRjV5UmFENXlPSmpTOWgvNGFJcThhUW5ldXZMekZZSGhHaENnU2NZOWhGeWZRVlhvREZyZWRONUhQZkpxbVQ0RVFBSitBVUZCTm8yT3M4ZDZPME9hMSt1VDNlWHE5UlJKSFRsb25MY0x5S0hxSExYRnNpUFBZdnN6UnpEekdPSWd4c3p5ZFlmaUowNmk3alQwSmx5MGdoT0o5SzVCcG1vbC9DNmdjVE9DQkZBcW5ib2dETnFpT29VbU5oUkFJTUpWdlUyTjVaRTJORWRUK1l6Y3dlT3o0VkowNGlTdnVKaFpaeEw3dktWLzVpbkRiN3FwOFJoaUt0eURueUZvZ2swbVpWcUQzZEY3TnZCUUt1QW9LTjhwSk5jY04rMStJN2tEb2M0aGZsUnI2eDNSYStySFRnTHYrRXQyMHMwQUkzbkV1NExkSEw4OUVwa3lTNVR3SXZCWEJISzRlTk56OHQvZWJmNVVLRnFTS2ZSYytFbDFHTlh4eTBkNWZrRkN6ZEpuQzVocmlxY0R3aHFiWU15S0xGK3htRkVZZmYxbElJZDc3MjRYZHYxMkRyTkF5RWxOK05xRTlNNGY2M0NiRmFnNGlrSFI3UTc1cFRmc0ozN3pSMVJnWENGNlZvdm54NWJVL3pRN0c1cGFMUGIvLzVkOUFrQXRKcDIvcjdOMFM5aVpoYXBzaXZwUXd3TFZPeFhZM0x4VkRRbENuUG02bW5sV0FYVGszTzMxaEl3YVJZZC9TVytyMGNyMnpuRFpleE8rNmlMMTBTM2dXRkRoVWlKdFJQSHRnYXpnR0ZEbkMvLzZVTzdBR3pyYXkwMjloQVZ6YnkwY3NnQW5KODlJNGxaRTJwL3pCUkZwQk9GeFdLc0d3L1hKQmlOSFRqeTVxVUdaRjFwTlV4aldaUEwxZU04UUVISFplUmF3Z2srTTBzZFVNUEFVVlBHdmJNVTl5M3kwc2Nnd2dsbHVoRHVpUnBLMzhwT1MxdWdaZVFxdEdxNUdyWGh3ZWo2N2xJR1pJUkEzRlNMaWZnRkQxbVRTY25IVm12eFdvY0p0QWZlZG9aK1RQUTJid3M3eWJxWUVVVEVYRUQ2TVlVck4xTy8xajJDMUYzUUxSUGNiNnEwajFEb2gwTkpxTmdUeG4vM3JIT1NrUENjRzk1NFFOUXRLbUNQbFh6ZzlVSkxHYXR6a3U3RitTRTZaZnEzdFR4cXJrcVNvWE9mVW54Q1o1WVI5NFUyU2RxQk5JeVFVaUFldFpVL0RxU3ZuYVJWcnU1dkFSdTBBcFYwQmI1SmNRbzA4aXhORkVBczVtSTlPZjc0UWJPd2JUMlhWVytYRFVnSEd4NjgrS1hEL3lJeVFvdlM5a0dlY3RYT1N4dGs3UlVvcjJhRkEvOVNUbUlkMkw4ZFRPQXJOZ041QU0xZTlTYkhRS2d5alZUNEtPb1FLNW1DaWRkNW55VzVYY3EzUlhHSWd1MVFNL2k4TE1Bc2R6Tm0xRTliQWVGVkVhM3A1bDBGb3FNRjN1a21GcDhXMFZLWkdCOG1rMmx3TEQyQ1QxeWlVRGRnR00rczRBWmtrWkJhRVI0SE9JTjRmMXE0SlhnTnpYQ1pYSTZWV05LdUZmT1FTT2ZjZGc3cG1ZOXI2aXdyZ00xaFhrOWlVTWZITlBqeTduWVo5b0ZrUnRSL053QzUzbEkxS3kvKzBNSFVkVUM0RDlUWmVDcW5NbXpESTZaL2t4aHFhVTQ0ajUxQzRNRVBzNXJBL1NTZWhFV0lDSmk1V2hJUFlYYWRzS0ZlUW5mVVlBNUhhSnU4MXNFVGtNU3Q2cWE5c1pwbXhpQUx0bmF2bjRFNW9ocmVpU3JqaEsvTyswRzBoNDFMODIyWmdtSHhWVHBFdllKaXcxVmtwMXYxd1p4czVsWXVacUdsUDRuSU5xanZtYWtiSWZzZ09MUnVKMG5PckpOek5DY0tGM2xDYXJFUFE4V1c2ay82Q0dEUzFId1hvS210blQzWXZtVzZNZWlxVWRGK0hCVzNvR0dXZkFaR1Z1RkE3OFJ2bURLTGl3WnV2Z2p2UXlWaGY5L3B3ZFF1QUJQd1MvUUQ0c2RSblRId3BMdFVncmVMb2VqRHhIQ0VKa2pkN21QZG1JT0o5Rm9LdHViZ3h6YUwwQjI4SlRySUhvRVZZU3RJVjBnZm9Zc2tianY4RHA1SE9oaXRLb2FmMVJzOHBuOVl3UitacUhqV3p4ZG15b2dKVjZuWWJuQnB6N1hJVU1kRFBhb3Q0S2xBRGdGSEdwbkdQUXBoOGRzNXZtWERWYURtLzFOVlVQWUk1NjNUa0RzVU12SVk1YVZVZS9jeGtmTW5VazUzVHFZaVpqZFBodWRmdHB3aEpxanNMZWovL0hUdzJYR2VsbFlzMlh1RTgrQkJWcFpuZWR2YlFXWjEwUEt6YW9LQ3NzUUNZM3U5ejE3dVM0UG1XVUtOc2k3V1k1NlROZXFQNjlJZTljUFE4VU9rci9DaGxUaVF5UlhMNENZQ3J1S0lvTEJsaXVHU3FSeHBZMldtZXVmdzRIeS9aK0NMdkpPUVlXWnllRS9sUXBTQW9rOGkyY1FnTzROU2I3NGxDRXNzNHVlVUtFc1BuNS82STI2M29VM09jQ0xtcWN2aGhxRUZ3ems4MkV4VnpNMDNHSW5OSEIzUXRWMWZNUmFZaGRwK3RXd0hWV0xIWEVoZFQ1RFhlR2tzbnFEZk1pdjZ0djA1UklMenRuWWJDWVBFSzE5VXFzSmJGYmZRdjY1eEhHT2lYNXlkWm81K2tyMWRBelJzZHkyOXpxUTE1UmU5Wlp5TS90bUluQnk1TFRjWG80VC80WHhlRk5zVUpibytkWlpjQjJzY1hnakhhK0FnbUVCZDI2Q29VUGxOcTU0OXBCeFN4M0VpclRJejJQNS9zNHExRUdxKzdPeEUvNzhDUDBEVURrQUNhVm9qMGIwTlllSGErZFdTdWJjZ2MzaVpUYlBXSHY0TTRucWxuVlRnT1JuK1E5MXpZVHZqdWIxQmg3M3JBQVJ2VUZ2Ny85VXJqTzNjYmV2YzhBZnFLWW1qZnFQOFkxUFVhTDNoN0JXTW5LZTVaUkhWbDgwdnNjVWY1TmhINVRRVGk4aDlhYTRsV2NlajRRNEJKaDhZVU51aVZZckorbGNwN3NsVUNqZVVTNGxySjVKdUg0UWtzS1ZiWDRJTzQrb1VDSER4ejJ6aHdMMVdHdVE4Y0FIWk5SUmF6VkN1L2pwbWw4WXZJYWY2MndlcGZTaVBJNG5OQUYveWNRUktVeEswd2dPRFhwdHBTaG9BaGZ3Rlk4WUF6Wk13QXhRcllxN2dhSVRsaTRRPT1UbUY3Z0VIVUJLaGxrYVZUIiwiZXhwIjoxNjIyNzE0Mzc5LCJzaGFyZF9pZCI6ODIwNzg2MDg2LCJwZCI6MH0.LRxYkDvm3fix0Tv7TKB3uC6Yr8d6pwTvaT6ugJyD9YI"
            },
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
              "integerValue": "57"
            },
            "removeCustomerLogin": {
              "booleanValue": false
            },
            "emailOptIn": {
              "booleanValue": false
            }
          }
        }
      }
    ]
  }