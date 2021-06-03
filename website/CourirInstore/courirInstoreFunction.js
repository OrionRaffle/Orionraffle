const axios = require('axios-https-proxy-fix')
const colors = require("colors")

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const extract = require('extract-json-from-string');

const getSession = async (proxyconfig,country) => {

    try {
        const resp = await axios({

            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                'content-type': 'application/x-amz-json-1.1',
                'Connection': 'keep-alive'
            },
            method: 'GET',
            timeout: 10000,
            url: 'https://courir.captainwallet.com/' + country +'-fr/enroll/raffle-loyalty',
            proxy: null

        });
        
        return resp
    } catch (e) {
        
        return -1

    }
}

const sendForm = async (csrfToken, xsrfToken, captainSession,info,numero,proxyconfig,country) => {

    try {
        const resp = await axios({

            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                'Connection': 'keep-alive',
                'content-type': 'application/json;charset=utf-8',
                'accept': 'application/json, text/plain, */*',
                'X-CSRF-TOKEN': csrfToken,
                'X-XSRF-TOKEN': xsrfToken,
                'Cookie': 'X-XSRF-TOKEN=' + csrfToken + ';web_captainwallet_com_session=' + captainSession
            },
            method: 'POST',
            timeout: 10000,
            url: 'https://courir.captainwallet.com/' + country +'-fr/enroll/raffle-loyalty',
            proxy: proxyconfig,
            data: JSON.stringify({
                "store": info.idShop, 
                "cardId": info.idCard,
                "birthdate": info.YYYY + '-' + info.MM + '-' + info.DD,
                "sneakerSizes": info.size
            })
        });
        return 'https://courir.captainwallet.com/fr-fr/raffle-dunk-2?store='+info.idShop+"&channel=store&tag="+info.idShop+'&skip-hash=1&user[cardId]='+ resp.data.cardId + '&user[tier]=mycourir&user[cardExpiresAt]=null&user[identifier]='+resp.data.identifier +"&user[firstname]="+resp.data.firstname + "&user[lastname]="+resp.data.lastname + "&user[balance]=" + resp.data.balance +"&user[employeeTypeCode]=0&user[birthdate]=" + resp.data.birthdate + "&user[sneakerSizes]=" + resp.data.sneakerSizes+"&user[offers]=" + resp.data.offers
        
    } catch (e) {
        
        try {
            if (e.response.data.error.includes("aucune carte")) {
                console.log(colors.brightRed("[Error][" + numero + "][" + info.name + "] Problem with this card"))
                return 0
            }
            if (e.response.data.error.includes("Ce compte a déjà été utilisé")) {
                console.log(colors.brightRed("[Error][" + numero + "][" + info.name + "] Card already use"))
                return 0
            }
            if (e.response.data.message.includes("Server Error")) {
                console.log(colors.brightRed("[Error][" + numero + "][" + info.name + "] Error with field"))
                return 0
            }
        } catch (e) { }
        return -1
    }
}

async function courirInstoreMain(info, numero, proxy) {

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


    data = await getSession(proxyconfig,info.Country)
    if (data == -1) return -1
    csrfToken = data.data.split('csrf-token" content="')[1].split('"')[0]
    xsrfToken = data.headers['set-cookie'][0].split(';')[0].split("=")[1]
    captainSession = data.headers['set-cookie'][1].split(';')[0].split("=")[1]
    link = await sendForm(csrfToken, xsrfToken, captainSession, info, numero, proxyconfig,info.Country)
    
    return link
}

module.exports = {
    courirInstoreMain,
    getSession
}