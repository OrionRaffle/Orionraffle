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
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getSessionId(proxyConfig, user) {
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
                'customer[email]': user.email, //Email
                'customer[password]': user.password, //Password

            }),
        })
        //Cette condition permet de vérifier si la redirection va sur /account dans le cas contraire, c'est un problème de login (email or password incorrect)
        if (response.body.includes('"https://www.xhibition.co/account"')) {
            let sessionId = response.request.headers['cookie'].split(';')[0].split('=')[1];
            return sessionId;
        } else {
            logError("Login error: Open a ticket please", true);
            return null;
        }
    } catch (err) {
        console.log(err)
        // return handleProxyError(err);
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
        }
    } catch (err) {

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

        console.log('Récupération SID (' + user.SID + ')')
        console.log('Récupération gsessionid (' + user.gsessionid + ')')

    } catch (err) {
        console.log(err)
        return 0

    }
}

const kithEntry2 = async (proxyConfig, user,raffle) => {

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
                'zx	': randomstring.generate(11).toLowerCase(),
                't': '1',
            },
            data: qs.stringify({
                'count': '1',
                'ofs': '0',
                'req0___data__':
                {
                    "streamToken": "GRBoQgKB9LW1",
                    "writes": [
                      {
                        "update": {
                          "name": "projects/launches-by-seed/databases/(default)/documents/submissions/5I9HqC8KfsE4POCyw28z-5248308969544",
                          "fields": {
                            "currentDate": {
                              "stringValue": m.format()
                            },
                            "campaignId": {
                              "stringValue": raffle.campaignId
                            },
                            "customerId": {
                              "stringValue": user.customerId
                            },
                            "type": {
                              "stringValue": ""
                            },
                            "size": {
                              "stringValue": user.Size
                            },
                            "model": {
                              "stringValue": raffle.models
                            },
                            "modelName": {
                              "stringValue": raffle.modelName
                            },
                            "location": {
                              "stringValue": raffle.location
                            },
                            "locationName": {
                              "stringValue": raffle.locationName
                            },
                            "email": {
                              "stringValue": user.email
                            },
                            "phone": {
                              "stringValue": user.phone
                            },
                            "firstName": {
                              "stringValue": user.firstName
                            },
                            "lastName": {
                              "stringValue": user.lastName
                            },
                            "zipCode": {
                              "stringValue": user.PostalCode
                            },
                            "customerObject": {
                              "mapValue": {
                                "fields": {
                                  "currentDate": {
                                    "stringValue": raffle.currentDate
                                  },
                                  "campaignId": {
                                    "stringValue": raffle.campaignId
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
                                                "stringValue": user.Address
                                              },
                                              "address2": {
                                                "stringValue": ""
                                              },
                                              "city": {
                                                "stringValue": user.City
                                              },
                                              "company": {
                                                "stringValue": ""
                                              },
                                              "country": {
                                                "stringValue": "United States"
                                              },
                                              "country_code": {
                                                "stringValue": "US"
                                              },
                                              "first_name": {
                                                "stringValue": user.FirstName
                                              },
                                              "id": {
                                                "stringValue": user.IdAddress
                                              },
                                              "last_name": {
                                                "stringValue": user.LastName
                                              },
                                              "phone": {
                                                "stringValue": user.Phone
                                              },
                                              "province": {
                                                "stringValue": user.Province
                                              },
                                              "province_code": {
                                                "stringValue": user.IdProvince
                                              },
                                              "street": {
                                                "stringValue": user.Address
                                              },
                                              "zip": {
                                                "stringValue": user.PostalCode
                                              }
                                            }
                                          }
                                        }
                                      ]
                                    }
                                  },
                                  "addresses_count": {
                                    "stringValue": user.Address_Count
                                  },
                                  "email": {
                                    "stringValue": user.email
                                  },
                                  "first_name": {
                                    "stringValue": "Bastien"
                                  },
                                  "has_account": {
                                    "stringValue": "true"
                                  },
                                  "id": {
                                    "stringValue": "5248308969544"
                                  },
                                  "last_name": {
                                    "stringValue": "Bougé"
                                  },
                                  "last_order": {
                                    "stringValue": ""
                                  },
                                  "name": {
                                    "stringValue": "Bastien Bougé"
                                  },
                                  "orders_count": {
                                    "stringValue": "0"
                                  },
                                  "phone": {
                                    "stringValue": "+33614145679"
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
                                    "stringValue": "United States"
                                  },
                                  "country_code": {
                                    "stringValue": "US"
                                  },
                                  "ip": {
                                    "stringValue": "109.209.0.71"
                                  }
                                }
                              }
                            },
                            "ip": {
                              "stringValue": "109.209.0.71"
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
                              "stringValue": "United States"
                            },
                            "countryCode": {
                              "stringValue": "US"
                            },
                            "site": {
                              "stringValue": "xhibition.myshopify.com"
                            },
                            "risk": {
                              "stringValue": "null"
                            },
                            "captchaToken": {
                              "stringValue": "P0_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXNza2V5IjoickNJUWFKdStDZEFKTFdKODBMbzdPcUZhSjJQeDZwTE0zaWxqSXVwbjNZSFBob1Y1Y2E1MFk0RVMzdWhzNUNyeDNLckI5YmpQOHQvUmRjL21xRXNNenEwSGVJWFQ2bkFkaTcyNnVBWC9PT21yV1lTQ3kvOFljK2VDZ0xKNW1JOEtGNFBuY2dBR3pETHdOVHZsNXhjZ2Y1MWpjNjZRMVJ2VE04dURqbGFIOXB0VjczVkVuVy9LUnI5dDFrZ2tML0ZHdDNoTEdxQkFKbU9HRkhJcnBBcmt2c0xDVHlManAyNkhtSlFFdTRyazlEdVQ5TzRPYzNrbmp4UHNqQWN6Rkh5V3dTUkl3bklGWEhLM0ZMMjg3QXlMSmovT1B2T0tVb0lCa0QrekxuZkdCQWZ5RHNuTnVkZ3hPYVpQUlg4ZldIS3IyS3FsN0lrT2thU3hwQk5tSlVBcTV0MDNnUFN6bzd1VUFZN3RPV2NHRTQ1dU1VV2p5TldTTExIam04SWk4NUdxV2x5THFjMld3TU1NSEt2NGpGb0UxcGJmbGlJRmV5VXVwdjBQeU1rMmZlVWp6dFdlaEFkUXpJUzdLVy9iVFRneXVJZmVzc20xZ21QdmpETzFCbURRWHB4QVpRdUZvQVUvZUV3MHpRMWVjZThlVlNET1ZYTDJ3amQrRHZWMzBvaEVWSkZ5aEZQV3ZPancrVzNBUFhrSElFTTR3ZjNkcVZFMWkrUzlLdzdrdkJQZ0xkdi9pUUlqVWJJWUE4N2FFVnBWaHFGRjVoUDhiNS90QkJuOVhCaXVvYXRpMlk4Wm4xUTJXbDU5MlBGS1MwaS9IbWpvWmRHaWthZ0JnZHl1bGR6VFhmcnprZ0pSZGpITFFjOXR2eEQ3ZjVHckN2aEI1bVQ0UEJwVCttM05Od3ZrTVQ4U08yd1A4dnRFNVV5b1pMbzRVci96MW1UVHRRNnFGSmZDWlJOYkQxRGhMZ2FxMEVqdFNwTHRkTXZnMGE5WjVaKytjb1F5bTZQdlZ3c2g4c1A5d1F2NmhMT1FtR3VncGlUYlNzQnNGbXc2REdNdWJkaForNEExVzBxRDRFNnk5TXkzL212TjVNaG8rSlJ0bEZyWnVpZkoyQmMyaW9DaktyN1VZek1OQWp0U2ZjS040UWYxVWp0K2VuVXBTbHRsbmxCM201RkN1bEpxdEVWaXJ3VUJvQ3VRUkJ6Q1lrcDg4N2REZXduampGc0pGbFJ1UU0yY3Rqb3c5RU5DN1RZQmp6QmxaWklFcjZRYkh4L2lTMkR4SFFabFNiSWQ5cTN6VFg2ZUI4d2lZS1BWc3BlUkhIeldDTURralRNVHZ2MEtYSnlFQVhyVm5mUVQyWGNFZlJkaGZ6eTVKUVQ3T1hTWWRRQ0NtS3FrQXFBMUQwTFJEN1I5WXBRNEx3QmlkV2kycEhFbzdBNm5Rb2lJK3BkakFpQllHTW5KVWtFUjdJdS9abDRIZm1ZOEt4bmJVbW1hZ3JiL1VRei9jVkZnVnVlZmFtZnVtd05tNVhYTXJIZlBWWDNyaGdWOEhjWUhoUnZkeVBFTWkvckFwZjNud3F6Qk9WUjQ1dTJidnEzSllUdjRhMXJFWTJKcGZ1K3hSWmx2NWdHVlY1TFNoR25tTzl2aDN2WnJQYkhUL1NSTmM5UGJNV0Z0TmNVdmJsVnNZUHVqdUNYMzg0RkdxU0lZYlk3N1VXUWFFRTR6SE8wQ2MxTW85MHBuSDFWdEE3Vk5PUWtPWDN1MXhET2NhMEk5RkRFUEhVaEtLTUVxSFpsRmltRGRCQUJUU1ArVVpuOGRnVDFyR09McXdBTEhWeDdOSFpLRlRBK3FRYXVyUFArVHBuNXRvUzBqZzk1V2pia1lHSTJrTGhsZkNlQnRrK1E0Rzlha1FqaGxUTFUrMHFZSGZVMmNaZEhXV0dMODl6Y2VmTld2L3YvT2R3WHlpM3JaKzV1V1hZUmV6M3NjZHFKNWd1Rmt4M1o5b1gvRGx2RjJ4RE5hTXUwMng4Nk1tOHgrTmNwak16bmJCRytuUG9KcExhWThoU01xckFodU9xRTFzZTEraWFnYVdHRTZYc1czTGtxZUhvMExHbG5hU1J2VzRQRk91eXlIeVhnVXozeDJCU1lLOEZnbUpRcVZGcUNFN215UlcyWURJaUk5bzN6QWhvZzVUanBHZkc0RlVRc0ZLRVFHbDFsWmIva3dEdE1wQ2U1Wml5bVpSQm1WYkdwNEtwR0RKSTN1ejlDZkJzRnhZQ1R1QWhOYlFqQlo3c0NKOVowR2NRcmNzTFNWVm9TMExFYUN2TERZbXh4L0RmcUZ4Nk95a3k2Wkl6bDRDZ1lGMlZKNTdwSE84RlR0azR0bm9zWGlPRUdLbVRkdmdmdHMxaDNvMWhZdXBQSHlyY3ZJemhuVDRWRERSSXQyVzhGZmFXVkd5S3hNQWM1QzFtM3NTRUNRbG5NTmwvQUtIM012TUM0QUZ3QURnSDJmQVZtbkM5S2NKdjJUR09uR3ZmVW04V3hYak1NdVN3Rkx0eS9LZnpUTStvYVkxTmFoYWt2RXc0b1llRnh5RVdRMTZCSjM3MUt4L3l0aXFCa0M0K010RXNHUWlSS0oxZWFUR0RqQ2JwcGorenFtNkJnUGNNVjM4OXBqYTNjM09wTnExd08rRkhTd2hmdlhHeHI4ekgxVXFhTXM1dUNEak1JaGpEalVqa0JabDZuV1B4OGRoRzdjWTgyS3R1aHdGQUE0Zkt0UEpmWFRqV3dEdlQxRHI1dUxBRjkrUnlXVzBnLzllcytTVG5vTzBpZnpCS0RneWRLWmpHYUI4OFlBUmZGM2VpbC82bEdNWUM0QUhqSkpRdGUxVzFlaHBpVlAyTm9GSEphTEhRd1hDYmYwSXlxU0FTUCt1U2tzQzRxNEZRdW9IVEM4MHNuYlZSOGhxZTNrciswOTlVcGE0aGtmZmdIZjBuR1h6V1lDc3g0TENyVXA2R0Q4My8wcTI2OUR2STJiSExIdkhkN1hnOUN1TmRXQ24vNStnT1dYNDcrZWVMaVhZV3p4L2c5c3hzdXEwaEV5TE1ERlZzeVkxQXlJbWFTUjN1YTlFUGhsTHMwOFpBbUFLcTloNUpGMkw1Ty9Kb2M2dDluNmlaS1NySDd6WnBTOXZvTmRnL1drTGY0QXFISzY1blluN3BaVmhkYjJsNGgrendnVEtNR1Q5L2xGc1h1R1R2TlJtbmcrVlM2N2hFWURNMktMNVB2TnNGb0lTRktlbDhnUXJqbGtiRU45YmVqdmNhZHFlekErMzluY0VUaEw2bjAwbzA4Nld5dGlXMU5PbEptcHFyOUJoZGRmQ2ptM1pGZExQRERPTTJHQjJHSXBILzZIOHhSdzZ0MXlIRWhTMHI0WDUxdWxDQktGajlFRGZCQkJEYXI0QkdFT0FzbFJjeDdRdnUwcXliT2greWJsNXlHMG1MVlNmUlQ5cnU0T3dadjE2SFhaREczT2drMEVJUHVOVTErVDJLTW1RUUNieUhXMmNwY3Z2V1NSY1QvZzJxakkxamhRdHdNY3ZqdUVKcUFuRHEwVVdyamd0UXExdmloZWRlNlVwT2lQQk9PTXNzRVpUcDhTa0xiMjlyckc1OHloSXpKRWVJdEZ4Q0ZMbHdqdTUwdGdwMThoZGpBNVIrMFRZMHFGN1ZUSlV4OW1ZbmdGSW1QdjVhZlRXejl2RzkrWGpteGswcjlxSjcybE82YVBWQmNuc1FOc0JwWVNya1k4R1JPbFZnTmw1UmR4TGZMVXNJSGRubFpaTDg2QTA0ZFhuaDZGMVNlVmRjL2oyUGpIdHNYcG1KYzFMdEcwMnJCK2JPTlBQTDVvZTMxY2RWU245SFR4Z1ZYUlA3cHBrQjc1TFp1dzdCTzM5RlY1ZnFLQVc5T3VETEcra3ZPQ2xXY2ptQjlSVmx3a2JWOUkzaFowZjJqYTRWRjhvRGJLODNKS2l1bTJtaFhiK0VacitHR2xWazJtR2kxUlFNVDYrbWVpYjZtSkF3VnVnZzkzYmhHdEJGbzY3T1ZVQkxWWFNyWkNTc1JIUXNwNGszbVBkVEtEVU1wMzdBOHNhbTdmRlNreHBjZ3cvWEU5VkFuU2NRaWtYMCtZOXE1NUk1dUpkekRPQmVCbUlYMUw0aXB5eVROK1UySDhWODZ4VC9qVGdNQlhzaUxWc3g0V1lQVklZZTVlU1YwbVRiUDd1M1FNdmVrYXpFdVE1aGJIK3ZqNjg5U2xTU28rRlpZNTh3SFRFKzBBNG5weXR2K1k5Z3R6K0VxWWM5emtUM2dXZXl3S3ZjK3JCRGZyWXI2U0lFa3BqZ2ZxampScnBHQVVFZnBjUVU2YkNZTXVZTjMwV1Y5R0RjZXF3RDE4VDVaQWNhTkZTMEcvVUZJcC9ReGx3Mm1pL0FqNkRBa0FFazYvYTdhV0t4K2JjMHpoZ1dTZkF4SkcyTkVCOGNYNWdjN0paUGN0Yzh2SDNTWEt3Mk02Z2p4QmpyWklxYnlqSytjZ2Y1RlhGZ0lpM1IrUzIyb3IvZkZOVm1DTUhOOTROK2ZBMWxSSFVFTWNvQlArWGZJbitWZGpHbHJTaVFaSXpTVnJPd0pjUEh1VXJPcWlONFBQWFovOG05UHlZTTFPaUxkTHJad0pRNzVFeGY0YnNGWDNaVjZmQkl6NzQ5VWlIb2I5S2RxemtnUU15bHJISU1wbTdaU3F0N0ZPNVRKdmMrTzExdElIS1dzNmxDaEJvR0lhZmxqa09tSW5jbElEK3JkZC9uczVUNFJhcU1vMGxpMDlYNWRUckVmNFdnaXdNMHIzVENEKzdwOG1pYmVvRGErRG5vWWdNZUduUVpCMHRSNDcxdzZpaVU0N3B4TS90cGNyUFJmbjRxNnA1WnhWTm5TNGl3T2hGb2xxY2dTQ2hPY2ZCdEt2anlxQzhDQU5McE93bUtHcmhUL0RsWGlnbHYrWW1QMGVzVWdPRFcycEMxQVdhNkMvNFlaT1BZU3Z5bkhnQUJid2tlYTA2OXFOQ0JCaWt0OWphZUhVU2Z4dXl4dG93M2ptQktkN3AzSldhd3pSZEUraVVjNnBCSG5VM09ES2hmcU5YY3pyY3g1T3JBUEQxdU0wOFkwQ2VBU1ZUUlJYQ1VDeXYyWUwrcUdjUWU1MnMySW9KcTlSb2RydWs5WE12L2FCZ2dycmFacms1UDlycEp5SXQrK0U0bkFTY2h2MUc4Qm9vK0NJeHRxN1kwNEhkQ3VUUWVRVXY1b0orVlhxUjFDMVVqd2RIc1ZoY3RiSFZSUHY5d1BWRDBtNkoxSytQM2Q1K3lYSFgwTC96bHhlVmJKYmNWaExvRWdaUjRVR3ZoVStYMVpBQzNyeGZzVUgwR1hNVVJTcGxIMlBhYWxBaHZaaFM0ckdyZm9HMzJab2RKYjBpUT09VUJFY25iQjd2bnFZRzNTMCIsImV4cCI6MTYyNTgzMDM4Niwic2hhcmRfaWQiOjgyMDc4NjA4NiwicGQiOjB9.GNilK1kAOb9RZsPs9E4MGfzsUNHsTND7C3Ns9UFBUBA"
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
                              "integerValue": "31"
                            },
                            "removeCustomerLogin": {
                              "booleanValue": false
                            },
                            "emailOptIn": {
                              "booleanValue": false
                            },
                            "secretCustomerId": {
                              "stringValue": "1625681361665_8039452"
                            }
                          }
                        }
                      }
                    ]
                  }
            })
        })



        console.log(data.body)
     

    } catch (err) {
        console.log(err)
        return 0

    }
}



async function raffleXhibition() {
    // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    // const user = {
    //     'email': 'clementTest@gmail.com',
    //     'password': 'POKEMON1'
    // };
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
    console.log(s)

    // await getAllRaffle(proxyConfig, user)
    console.log('LOGIN')
    // country = await getCountry()

    sessionId = await getSessionId(proxyConfig, user)
    // console.log(JSON.parse(country))
    console.log(sessionId)
    if (sessionId == 1) return

    await getInformation(proxyConfig, user, sessionId)
    console.log(user)
    console.log('------------------------------')
    // await sleep(500000)
    // console.log('\nENTRY')
    console.log('\nFunction 1')

    // await xhibitionEntry1(proxyConfig, user)
    // await xhibitionEntry2(proxyConfig, user)
    await sleep(500000)

}

raffleXhibition()

module.exports = {
    raffleXhibition
}