const path = require('path');
const axios = require('axios-https-proxy-fix');
const qs = require('qs');

const { sleep } = require('../utils')

const {
    displayLydiaMode,
    displayLydiaSMSCode,
    displayLydiaAppCode,
    logError,
    logInfo,
    logSuccess
} = require('../console')

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

    var response;

    //const modeChoice = await askFor3DSSolveMode();
    /*
    switch (modeChoice) {
        case 1: //SMS
        response = await solve3DSFromSms(newUrl, shortCode, newPareq, stripeLink, proxy);
            break;
        case 2: //APP
        response = await solve3DSFromApp(newUrl, shortCode, newPareq, stripeLink, proxy);
            break;
        default:
            break;
    }
    */
    response = await solve3DSFromApp(newUrl, shortCode, newPareq, stripeLink, proxy);
    
    logSuccess('3DSecure confirmated.', true);
    const pares = response.split('="PaRes" value="')[1].split('"')[0];
    return pares;
}
async function solve3DSFromApp(newUrl, shortCode, newPareq, stripeLink, proxy) {
    await displayLydiaAppCode();
    const response = await sendForm(newUrl, "lyda", newPareq, stripeLink, undefined, proxy);

    if (response === 'FAILED') {
        logInfo('Error, please try again.', true);
        return await solve3DSFromApp(newUrl, shortCode, newPareq, stripeLink, proxy);
    }
    return response;
}
async function solve3DSFromSms(newUrl, shortCode, newPareq, stripeLink, proxy) {
    const number = await displayLydiaSMSCode();
    const response = await sendForm(newUrl, shortCode, newPareq, stripeLink, number, proxy);

    if (response === 'FAILED') {
        logInfo('Wrong code provided. Another one was sent, please try again.', true);
        return await solve3DSFromSms(newUrl, shortCode, newPareq, stripeLink, proxy);
    }
    return response;
}

async function sendForm(newUrl, shortCode, newPareq, stripeLink, code, proxy) {
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
            proxy: proxy,
            data: qs.stringify({
                'MD': '',
                'PaRes': '',
                'otp_attempt_counter_after_kba': '0',
                'is_kba_completed': 'false',
                'pareqToken': newPareq,
                'programShortCode': shortCode,
                'termUrl': stripeLink,
                'oneTimePasscode': code
            })
        });
        if (resp.data.includes('Le code de vérification n’est pas correct') || resp.data.includes('"PaRes" value=""')) { return 'FAILED'; }
        else return resp.data;
    } catch (err) {
        return 'FAILED';
    }
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