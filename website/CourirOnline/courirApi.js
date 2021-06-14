const path = require('path');
const { SRPClient } = require('amazon-user-pool-srp-client');
const axios = require('axios-https-proxy-fix');
const aws4 = require("aws4");
const qs = require('qs');
const { handle3DSecure } = require(path.join(__dirname, '../../utils/bank/3DSecure'));

const {
    initProgressBar,
    updateProgressBar,
    logError,
    logInfo,
    logSuccess
} = require(path.join(__dirname, '../../utils/console'));

const {
    handleProxyError
} = require(path.join(__dirname, '../../utils/utils'))
const {
    getPhoneNumber
} = require(path.join(__dirname, '../../utils/generateData'))
const {
    getIp
} = require(path.join(__dirname, '../../utils/gateway/gateway'))

async function ckeckUsername(account, srpA, proxy) {
    proxy = {
        host: '127.0.0.1',
        port: '8888',
    }
    try {
        await axios({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                'content-type': 'application/x-amz-json-1.1',
                'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
                'Connection': 'keep-alive'
            },
            method: 'POST',
            timeout: 10000,
            url: 'https://cognito-idp.us-east-1.amazonaws.com/',
            data: { "AuthFlow": "USER_SRP_AUTH", "ClientId": "165cbvf0gsromjvtdeor72t0pj", "AuthParameters": { "USERNAME": account.Email.toLowerCase(), "SRP_A": srpA }, "ClientMetadata": {} },
            proxy: proxy
        });
        logError(`[${account.Email}] Account already exist.`, true);
        return false;
    } catch (error) {
        return true;
    }
}
async function getAmazonTokens(proxy) {
    try {
        const response = await axios({
            headers: {
                'Host': 'cognito-identity.us-east-1.amazonaws.com',
                'Connection': 'keep-alive',
                'Content-Length': 63,
                'x-amz-target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
                'x-amz-user-agent': 'aws-sdk-js-v3-@aws-sdk/client-cognito-identity/1.0.0-gamma.2 Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 aws-amplify/3.3.3 js',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
                'content-type': 'application/x-amz-json-1.1',
                'Accept': '*/*',
                'Origin': 'https://www.eql.xyz',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://www.eql.xyz/',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'
            },
            method: 'post',
            timeout: 10000,
            url: 'https://cognito-identity.us-east-1.amazonaws.com/',
            proxy: proxy,
            data: { "IdentityId": "us-east-1:01871c08-417f-497f-8fe8-bb74b9d93d26" }
        });
        return response.data;
    } catch (err) {
        const handle = handleProxyError(err);
        if (handle === null) {
            return logError(`Unknow error, open a ticket please.\nError:${err}`, true);
        }
    }
}
async function getCourirToken(secretAccessKey, accessKeyId, sessionToken, raffleId, proxy) {
    const request = {
        host: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
        method: 'POST',
        url: `https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/payment/token`,
        path: `/v1/payment/token`,
        proxy: proxy,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
            'content-type': 'application/json',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
            'Accept': 'application/json, text/plain, */*',
            'x-Amz-Security-Token': sessionToken
        },
        data: {
            'drawId': raffleId
        }
    }
    const signedRequest = aws4.sign(request, { secretAccessKey, accessKeyId, sessionToken });
    delete signedRequest.headers.host;
    delete signedRequest.headers['Content-Length'];

    try {
        const response = await axios(signedRequest);
        return response.data.token;
    } catch (err) {
        const handle = handleProxyError(err);
        if (handle === null) {
            return logError(`Unknow error, open a ticket please.\nError:${err}`, true);
        }
    }
}
async function confirmStripeClient(account, token) {
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
            method: 'POST',
            url: 'https://api.stripe.com/v1/setup_intents/seti_' + token.split('_')[1] + '/confirm',
            timeout: 10000,
            data: qs.stringify({
                "payment_method_data[type]": "card",
                'payment_method_data[billing_details][address][city]': account.City,
                'payment_method_data[billing_details][address][country]': account.Country.trim(),
                'payment_method_data[billing_details][address][line1]': account.Address,
                'payment_method_data[billing_details][address][line2]': account.Address2,
                'payment_method_data[billing_details][address][postal_code]': account.PostalCode.trim(),
                'payment_method_data[billing_details][address][state]': account.State.trim(),
                'payment_method_data[billing_details][email]': account.Email,
                'payment_method_data[billing_details][name]': account.FirstName + " " + account.LastName,
                'payment_method_data[billing_details][phone]': account.Num,
                'payment_method_data[card][number]': account.CardNumber.trim(),
                'payment_method_data[card][cvc]': account.CVC.trim(),
                'payment_method_data[card][exp_month]': account.MM.trim(),
                'payment_method_data[card][exp_year]': account.YY.trim(),
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
        return resp.data;
    } catch (err) {
        console.log(err)
        if (err.response.data.error.type.includes("card_error")) logError(`[${account.Email}] card error, probably CC.`, true);
    }

}
async function getStripeAuth(stripeToken, proxy) {
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
            url: 'https://hooks.stripe.com/redirect/authenticate/' + stripeToken,
            proxy: proxy,
        });
        return resp.data;
    } catch (err) {
        const handle = handleProxyError(err);
        if (handle === null) {
            return logError(`Unknow error, open a ticket please.\nError:${err}`, true);
        }
    }
}


async function register(account, proxy, numero, getAnotherProxy) {
    logInfo(`Trying to register ${account.Email}.`, true);

    const srpClient = new SRPClient("nyu5Glqkw");
    const srpA = srpClient.calculateA();

    account.Num = getPhoneNumber();

    const isUsernameValid = await ckeckUsername(account, srpA, proxy);
    if (!isUsernameValid) return;
    var amazonTokens = await getAmazonTokens(proxy);
    while (amazonTokens === undefined) {
        try {
            logInfo('Proxy doesn\'t work, moove to another one.', true);
            proxy = getAnotherProxy();
        } catch (error) { return; }
        amazonTokens = await getAmazonTokens(proxy);
    }
    const ip = await getIp(proxy);
    if (ip === undefined) return logError('An error occured. Entry canceled. [Code 1]', true);
    account.Ip = ip;

    const sessionToken = amazonTokens.Credentials.SessionToken;
    const accessKeyId = amazonTokens.Credentials.AccessKeyId;
    const secretAccessKey = amazonTokens.Credentials.SecretKey;

    const token = await getCourirToken(secretAccessKey, accessKeyId, sessionToken, account.IdRaffle, proxy);
    if (token === undefined) return logError('An error occured. Entry canceled. [Code 2]', true);
    const stripeData = await confirmStripeClient(account, token);
    if (stripeData === undefined) return logError('An error occured. Entry canceled. [Code 3]', true);

    account.payment_method = stripeData.payment_method;
    account.token = stripeData.id;

    console.log(stripeData.next_action.use_stripe_sdk)

    const stripeBigToken = stripeData.next_action.use_stripe_sdk.stripe_js.split('/')[5];
    //const clientSecret = stripeBigToken.split("&")[0].split('=')[1];

    const authData = await getStripeAuth(stripeBigToken, proxy);
    if (authData === undefined) return logError('An error occured. Entry canceled. (It can be a card issue) [Code 4]', true);
    if (authData.includes("Authentification terminé")) {
        logInfo(`[${account.Num}] [${account.Email}] SMS Code successfully added (no 3DS).`, true);
        return 'SUCCESS';
    }
    else await handle3DSecure(authData, proxy);

    process.exit(1)

    data = await getPareq(bigToken, proxyconfig)

    if (data == -1) return -1
    pareq = data.split('value="')[1].split('"')[0]
    linkStripe = data.split('value="')[2].split('"')[0]
    linkForm = data.split('action="')[1].split('"')[0]

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


}


module.exports = {
    register
}