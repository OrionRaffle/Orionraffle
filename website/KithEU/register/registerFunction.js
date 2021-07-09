const qs = require('qs')
const fs = require('fs')
const request = require('request-promise').defaults({
    jar: true
});
const { csvReadProxy, csvRegisterKith } = require('../../../utils/csvReader');
const { solveReCaptcha } = require('../../../utils/2captcha');
const {
    percent,
    displayCaptchaChoice,
    displayMultitaskingChoice,
    displayModule,
    logError,
    logInfo,
    logSuccess,
    pressToQuit
} = require('../../../utils/console');
const { notifyDiscordAccountCreation } = require('../../../utils/discord');
const { sleep, handleProxyError, reinitProgram } = require('../../../utils/utils');
const { DEV, CHARLES, siteKey, moduleK } = require('../kithEUConst');

//Create Account Function
async function createAccount(proxyConfig, user) {
    if(CHARLES) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    if (DEV) console.log(`Create account (${user.Index})`);
    try {
        response = await request({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            proxy: (CHARLES?'http://127.0.0.1:8888':proxyConfig),
            resolveWithFullResponse: true,
            maxRedirects: 1,
            followAllRedirects: true,
            withCredentials: true,
            timeout: 3500,
            method: 'POST',
            uri: `https://eu.kith.com/account`,
            body: qs.stringify({
                'form_type': 'create_customer',
                'utf8': '✓',
                'customer[first_name]': user.FirstName,
                'customer[last_name]': user.LastName,
                'customer[email]': user.Email,
                'customer[password]': user.Password
            })
        })
        //Trigger le challenge, donc il faut switch de proxy (flem de faire le captcha)
        if (response.body.includes('eu.kith.com/challenge')) {
            if (DEV) console.log(`Challenge triggered (${user.Index})`);
            const authString = 'authenticity_token" value="';
            var authenticity_token = response.body.substring(response.body.indexOf(authString) + authString.length);
            authenticity_token = authenticity_token.substring(0, authenticity_token.indexOf('"'));
            const ssid = response.request.headers['cookie'].split(';')[0].split('=')[1];
            if (DEV) console.log(`(${user.Index}) AuthToken:${authenticity_token}\nSSID:${ssid}`);
            return {
                code: 'CHALLENGE',
                data: {
                    authenticity_token: authenticity_token,
                    ssid: ssid
                }
            };
        }
        // il y a une redirection /register (compte existe déjà)
        if (response.body.includes('eu.kith.com/account/register')) {
            if (DEV) console.log(`(${user.Index}) Auccount already created`);
            return { code: 'ACCOUNT', data: undefined };
        }
        //Check si l'on est bien sur eu.kith.com cela signifie qu'on est bien connecté / Récupération du sessionId pour accéder aux autres pages
        if (response.body.includes('eu.kith.com/"')) {
            if (DEV) console.log(`(${user.Index}) Auccount created success`);
            user.sessionId = response.request.headers['cookie'].split(';')[0].split('=')[1]
            return { code: 'SUCCESS', data: undefined };
        }
    } catch (err) {
        if (handleProxyError(err) === null) logError('An unexpected error occured.', true);
        if (DEV) console.log(`(${user.Index}) Error happened proxy error, ${err.code}`);
        return { code: 'PROXY', data: undefined };
    }
}
async function createAccountAfterCaptcha(proxyConfig, user, sessionId, solvedCaptcha, authenticityToken) {
    if(CHARLES) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    if (DEV) console.log(`(${user.Index}) Create after captcha \nSession id:${sessionId}\nAuth token:${authenticityToken}`);
    //process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    try {
        response = await request({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': `_secure_session_id=${sessionId}`
            },
            proxy: (CHARLES?'http://127.0.0.1:8888':proxyConfig),
            resolveWithFullResponse: true,
            maxRedirects: 1,
            followAllRedirects: true,
            withCredentials: true,
            timeout: 3500,
            method: 'POST',
            uri: `https://eu.kith.com/account`,
            body: qs.stringify({
                'authenticity_token': authenticityToken,
                'g-recaptcha-response': solvedCaptcha,
            })
        })
        if (response.body.includes('eu.kith.com/"')) {
            if (DEV) console.log(`(${user.Index}) Succes, session id:${sessionId}`);
            user.sessionId = sessionId
            return { code: 'SUCCESS', data: undefined };
        }
        // il y a une redirection /register (compte existe déjà)
        else if (response.body.includes('eu.kith.com/account/register')) return { code: 'ACCOUNT', data: undefined };
        else if (response.body.includes('eu.kith.com/challenge')) {
            if (DEV) console.log(`(${user.Index}) Anoter challenge triggered:\n ssid ${response.request.headers['cookie'].split(';')[0].split('=')[1]}`);
            return {
                code: 'ERROR',
                data: undefined
            };
        }
        else {
            return {
                code: 'ERROR',
                data: undefined
            };
        }
        /*
        else if (response.body.includes('eu.kith.com/challenge')) {
            console.log('CHALLENGE_TOO_LONG')
            const authString = 'authenticity_token" value="';
            var authenticity_token = response.body.substring(response.body.indexOf(authString) + authString.length);
            authenticity_token = authenticity_token.substring(0, authenticity_token.indexOf('"'));
            return {
                code: 'CHALLENGE_TOO_LONG',
                data: {
                    authenticity_token: authenticity_token,
                    ssid: response.request.headers['cookie'].split(';')[0].split('=')[1],
                }
            };
        }
        
        //Check si l'on est bien sur eu.kith.com cela signifie qu'on est bien connecté / Récupération du sessionId pour accéder aux autres pages
        else {
            return {
                code: 'RETRY',
                data: {
                    authenticity_token: authenticityToken,
                    ssid: sessionId,
                    solvedCaptcha: solvedCaptcha
                }
            };
        }
        */
    } catch (err) {
        if (DEV) console.log('Error happened');
    }

}
//Update ACCOUNT
const update = async (proxyConfig, user) => {
    if(CHARLES) process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    if (DEV) console.log(`(${user.Index}) Update is starting`);
    try {
        await request({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
                'cookie': '_secure_session_id=' + user.sessionId
            },
            proxy: (CHARLES?'http://127.0.0.1:8888':proxyConfig),
            resolveWithFullResponse: true,
            followAllRedirects: false,
            timeout: 3500,
            method: 'POST',
            uri: `https://eu.kith.com/account/addresses`,
            body: qs.stringify({
                'form_type': 'customer_address',
                'utf8': '✓',
                'address[first_name]': user.FirstName,
                'address[last_name]': user.LastName,
                'address[company]': '',
                'address[address1]': user.Address,
                'address[address2]': '',
                'address[country]': user.Country,
                'address[city]': user.City,
                'address[zip]': user.PostalCode,
                'address[phone]': "06" + Math.floor((Math.random() * 90000000) + 10000000),
                'address[default]': '1'
            })
        })
    } catch (err) {
        if (handleProxyError(err) === null) {
            logError('An unexpected error occured.', true)
            return 'ERROR';
        }
    }
}
async function register() {
    await csvReadProxy(handleProxies);
    async function handleProxies(proxies) {
        if (proxies.length === 0) return reinitProgram(`Proxy required for ${moduleK.label}`);

        var registerData = [];

        await new Promise(async function (resolve) {
            registerData = await csvRegisterKith();
            resolve();
        });

        displayModule(moduleK.label);
        const MAX_TASK = await displayMultitaskingChoice();
        displayModule(moduleK.label);
        const twoCaptchaEnabled = await displayCaptchaChoice();

        displayModule(moduleK.label);
        var successCount = 0;
        const csvLines = registerData.length;

        if (DEV) console.log(`CSV LINES: ${csvLines}`);

        var index = 0;
        var tasks = [];
        while (csvLines > index || tasks.length !== 0) {
            var user = registerData[index];
            if (user !== undefined) user.Index = index + 1;

            await percent(index, csvLines, successCount);

            if (tasks.length >= MAX_TASK || csvLines <= index) await sleep(333);
            else {
                if (DEV) console.log(`User : [${user.Index}|${user.Email}|${user.Password}]`);
                if (DEV) console.log(`User about to be register (${user.Index})`);
                let promise = registerUser(user, proxies, twoCaptchaEnabled);
                tasks.push(promise);
                if (DEV) console.log(`Promise pushed (${user.Index})`);
                promise.then((code) => {
                    if (code === 'SUCCESS') {
                        if (DEV) console.log(`Success (${user.Index})`);
                        successCount++;
                        fs.appendFileSync('./KithEU/createdAccount.csv', `${user.Email},${user.Password}\n`);
                    }
                })
                index++;
            }
            //Test if a promise ended
            for (let i = 0; i < tasks.length; i++) {
                promiseState(tasks[i], function (state) {
                    if (state === 'fulfilled') { // => Ended
                        if (csvLines > index) {
                            if (DEV) console.log(`User : [${user.Index}|${user.Email}|${user.Password}]`);
                            let promise = registerUser(user, proxies, twoCaptchaEnabled);
                            tasks[i] = promise;
                            promise.then((code) => {
                                if (code === 'SUCCESS') {
                                    if (DEV) console.log(`Success (${user.Index})`);
                                    successCount++;
                                    fs.appendFileSync('./KithEU/createdAccount.csv', `${user.Email},${user.Password}\n`);
                                }
                                else {
                                    if (DEV) console.log(`Failed (${user.Index})`);
                                    fs.appendFileSync('./KithEU/failedAccount.csv', `${user.Email},${user.Password}\n`);
                                }
                            })
                            index++;
                        }
                        else {
                            if (DEV) console.log(`Task ended (${tasks[i]})`);
                            tasks.splice(i, 1);
                            i--;
                        }
                    }
                });
            }
        }
        logInfo('All CSV lines was read.', true);
        logSuccess(`Recap:\n\t\t\tTask: ${csvLines}\n\t\t\tFails: ${csvLines - successCount}\n\t\t\tSuccess: ${successCount}`, true);
        await pressToQuit();
    }
}

async function registerUser(user, proxies, twoCaptchaEnabled) {
    logInfo(`[${user.Index}] - User about to be created : ${user.Email}`, true);

    async function handleCreationResult(result) {
        if (DEV) console.log(`(${user.Index}) Result :`); console.log(result)
        if (result === undefined) {
            logError(`[${user.Index}][${user.Email}]` + " | Too much fails accont won't be created", true);
            return 'ERROR';
        }
        if (DEV) console.log(`(${user.Index}) Result code : ${result.code}`);
        switch (result.code) {
            case 'SUCCESS':
                logSuccess(`[${user.Index}][${user.Email}]` + ` | Account successfully created.`, true);
                const uRes = await update(proxyConfig, user);
                if (uRes === 'ERROR') logError(`[${user.Index}][${user.Email}]` + ` | Address update failed.`);
                logSuccess(`[${user.Index}][${user.Email}]` + ` | Account successfully updated.`, true);
                notifyDiscordAccountCreation(proxyConfig, 'SUCCESS', user.Email, user.Password, moduleK.label);
                return 'SUCCESS';
            case 'CHALLENGE':
                if (twoCaptchaEnabled) {
                    logInfo(`[${user.Index}][${user.Email}]` + " | Challenge trigerred, solving request sent to 2Captcha.", true);
                    return await solveReCaptcha(siteKey, 'https://eu.kith.com/challenge', onCaptchaSolved);
                }
            case 'PROXY':
                logError(`[${user.Index}][${user.Email}]` + " | Proxy error, rotating proxy..", true);
                result = await registerUser(user, proxies);
                return await handleCreationResult(result);
            case 'ACCOUNT':
                logError(`[${user.Index}][${user.Email}]` + " | Account already exist.", true);
                notifyDiscordAccountCreation(proxyConfig, 'ERROR', user.Email, user.Password, moduleK.label);
                return 'ERRROR';
            case 'RETRY':
                try { var proxyConfig = getAnotherProxy(proxies); } catch (error) { return 'ERROR'; }
                result = await createAccountAfterCaptcha(proxyConfig, user, result.data.ssid, result.data.solvedCaptcha, result.data.authenticity_token);
                if (DEV) console.log(`(${user.Index}) Create acount after captcha result:`); console.log(result);
                return await handleCreationResult(result);
            case 'CHALLENGE_TOO_LONG':
                logInfo(`[${user.Index}][${user.Email}]` + " | Challenge solve came too late.", true);
                return await solveReCaptcha(siteKey, 'https://eu.kith.com/challenge', onCaptchaSolved);
            case 'ERROR':
                logInfo(`[${user.Index}][${user.Email}]` + " | A rare error happened, we will try to fix them for the next Orion version.", true);
                return 'ERROR';
            default:
                break;
        }
        async function onCaptchaSolved(solvedCaptcha) {
            if (DEV) console.log(`(${user.Index}) Captcha solved\nSSID:${result.data.ssid}\nAuth Token:${result.data.authenticity_token}`);
            logInfo(`[${user.Index}][${user.Email}]` + " | Challenge solved.", true);
            result = await createAccountAfterCaptcha(proxyConfig, user, result.data.ssid, solvedCaptcha, result.data.authenticity_token);
            if (DEV) console.log(`(${user.Index}) Create acount after captcha result:${result}`);
            return await handleCreationResult(result);
        }
    }
    try {
        var proxyConfig = getAnotherProxy(proxies);
    } catch (error) {
        if (DEV) console.log(`No more proxy (${user.Index})`);
        return 'ERROR';
    }

    var result = await createAccount(proxyConfig, user);
    return await handleCreationResult(result);
}
function getAnotherProxy(proxies) {
    if (proxies.length === 0) {
        logError('A process required a proxy but there is no more available.', true);
        throw 'No more proxies.';
    }
    const proxy = proxies.shift();
    return `http://${proxy.user}:${proxy.password}@${proxy.ip}:${proxy.port}`;
}

module.exports = {
    register
}

function promiseState(promise, callback) {
    var uniqueValue = /unique/
    function notifyPendingOrResolved(value) {
        if (value === uniqueValue) {
            return callback('pending')
        } else {
            return callback('fulfilled')
        }
    }
    function notifyRejected(reason) {
        return callback('rejected')
    }
    var race = [promise, Promise.resolve(uniqueValue)]
    Promise.race(race).then(notifyPendingOrResolved, notifyRejected)
}
