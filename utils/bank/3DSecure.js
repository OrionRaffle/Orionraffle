const path = require('path');
const { logError } = require('../console');
const { handleLydia3DSecure } = require(path.join(__dirname, 'lydia'));

async function handle3DSecure(data, proxy) {
    const pareq = data.split('value="')[1].split('"')[0];
    const stripeLink = data.split('value="')[2].split('"')[0];
    const formLink = data.split('action="')[1].split('"')[0];

    var pares;
    //LYDIA
    if (data.split('method="POST" action="')[1].includes('-acs.marqeta.co')) {
        pares = await handleLydia3DSecure(pareq, formLink, stripeLink, proxy);
    } //REVOLUTE
    else if (data.split('method="POST" action="')[1].includes('touchtechpayments.com')) {

    } //QUONTO
    else if (data.includes("3dsecure.monext.fr")) {

    } else return logError('Card provider unknow. Open a ticket please.', true);
    await redirect3DS(pares,stripeLink,proxy);
}
async function redirect3DS(pares, stripeLink, proxy) {
    const merchant = stripeLink.split("/")[5];
    const secure = stripeLink.split("/")[6].replace(/%20/g, "");
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
            proxy: proxy,
            data: qs.stringify({
                'MD': '',
                'PaRes': pares,
                'splat': '[]',
                'captures': '["' + merchant + '","' + secure + '"]',
                'merchant': merchant,
                'three_d_secure': secure,
            })
        });
        return resp.data;
    } catch (err) {
        return 'FAILED';
    }
}

module.exports = {
    handle3DSecure
}

/*
else if (data.split('method="POST" action="')[1].includes('touchtechpayments.com')) {


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

*/