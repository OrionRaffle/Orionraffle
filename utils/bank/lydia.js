const path = require('path');
const axios = require('axios-https-proxy-fix');
const qs = require('qs');

const { sleep } = require(path.join(__dirname, '../utils'))

const {
    displayLydiaMode,
    logError,
    logInfo,
    logSuccess
} = require(path.join(__dirname, '../console'))

async function handleLydia3DSecure(pareq, formLink, stripeLink, proxy) {
    async function askFor3DSSolveMode() {
        const choice = await displayLydiaMode();
        if (choice === 1 || choice === 2) return choice;
        logError('Invalid inputs.')
        await sleep(1500);
        return await askFor3DSSolveMode();
    }

    const formData = await getForm(pareq, formLink, stripeLink, proxy);
    if (formData === undefined) return logError('Error with Lydia 3DSecure, failed to get form.', true);
    const newUrl = formData.split('m" action=')[1].split('"')[1];

    const shortCode = formData.split('programShortCode"')[1].split('"')[1];
    const newPareq = formData.split('pareqToken"')[1].split('"')[1];

    const modeChoice = await askFor3DSSolveMode();

    console.log(modeChoice)
    console.log(newUrl)

    switch (modeChoice) {
        case 1: //SMS
            await solve3DSFromSms();
            break;
        case 2: //APP

            break;
        default:
            break;
    }
    return;

    shortCode = formData.split('programShortCode"')[1].split('"')[1]
    newPareq = formData.split('pareqToken"')[1].split('"')[1]


    if (input == 1) {

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
}

async function solve3DSFromSms() {
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
}

async function getForm(pareq, formLink, stripeLink, proxy) {
    const response = await axios({
        headers: {
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8'

        },
        timeout: 10000,
        method: 'POST',
        url: formLink,
        proxy: proxy,
        data: qs.stringify({
            'PaReq': pareq,
            'TermUrl': stripeLink,
            'MD': ''
        })
    }).catch(err => { });
    return response.data;
}

module.exports = {
    handleLydia3DSecure
}