const qs = require('qs')
const request = require('request-promise').defaults({
    jar: true
});
var faker = require('faker/locale/fr');;
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
const { DEV, siteKey, moduleK } = require('../kithEUConst');

//Create Account Function
async function createAccount(proxyConfig, user) {
    try {
        response = await request({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            proxy: proxyConfig,
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
            const authString = 'authenticity_token" value="';
            var authenticity_token = response.body.substring(response.body.indexOf(authString) + authString.length);
            authenticity_token = authenticity_token.substring(0, authenticity_token.indexOf('"'));
            return {
                code: 'CHALLENGE_TOO_LONG',
                data: {
                    authenticity_token: authenticity_token,
                    ssid: response.request.headers['cookie'].split(';')[0].split('=')[1]
                }
            };
        }
        // il y a une redirection /register (compte existe déjà)
        if (response.body.includes('eu.kith.com/account/register')) return { code: 'ACCOUNT', data: undefined };
        //Check si l'on est bien sur eu.kith.com cela signifie qu'on est bien connecté / Récupération du sessionId pour accéder aux autres pages
        if (response.body.includes('eu.kith.com/"')) {
            user.sessionId = response.request.headers['cookie'].split(';')[0].split('=')[1]
            return { code: 'SUCCESS', data: undefined };
        }
    } catch (err) {
        if (DEV) console.log(err);
        if (handleProxyError(err) === null) logError('An unexpected error occured.', true);
        return { code: 'PROXY', data: undefined };
    }
}
async function createAccountAfterCaptcha(proxyConfig, user, sessionId, solvedCaptcha, authenticityToken) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    proxyConfig = {
        host: '127.0.0.1',
        port: '8888',
    }
    try {
        response = await request({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': `_secure_session_id=${sessionId}`
            },
            proxy: proxyConfig,
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
        if (response.body.includes('eu.kith.com/challenge')) {
            return {
                code: 'CHALLENGE',
                data: {
                    authenticity_token: authenticityToken,
                    ssid: sessionId,
                }
            };
        }
        // il y a une redirection /register (compte existe déjà)
        if (response.body.includes('eu.kith.com/account/register')) return { code: 'ACCOUNT', data: undefined };
        //Check si l'on est bien sur eu.kith.com cela signifie qu'on est bien connecté / Récupération du sessionId pour accéder aux autres pages
        if (response.body.includes('eu.kith.com/"')) {
            user.sessionId = sessionId
            return { code: 'SUCCESS', data: undefined };
        }
    } catch (err) {
        if (DEV) console.log(err);
    }
    return {
        code: 'RETRY',
        data: {
            authenticity_token: authenticityToken,
            ssid: sessionId,
            solvedCaptcha: solvedCaptcha
        }
    };
}
//Update ACCOUNT
const update = async (proxyConfig, user) => {
    try {
        await request({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
                'cookie': '_secure_session_id=' + user.sessionId
            },
            proxy: proxyConfig,
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
        if (DEV) console.log(err);
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

        var index = 0;
        var tasks = [];
        while (csvLines > index || tasks.length !== 0) {
            if (registerData[index] !== undefined) registerData[index].Index = index;
            await percent(index, csvLines, successCount);

            if (tasks.length >= MAX_TASK || csvLines <= index) await sleep(333);
            else {
                let promise = registerUser(registerData[index], proxies, twoCaptchaEnabled);
                tasks.push(promise);
                promise.then((code) => { if (code === 'SUCCESS') successCount++; })
                index++;
            }
            //Test if a promise ended
            for (let i = 0; i < tasks.length; i++) {
                promiseState(tasks[i], function (state) {
                    if (state === 'fulfilled') { // => Ended
                        if (csvLines > index) {
                            let promise = registerUser(registerData[index], proxies, twoCaptchaEnabled);
                            tasks[i] = promise;
                            promise.then((code) => {
                                console.log(code)
                                if (code === 'SUCCESS') successCount++;
                            })
                            index++;
                        }
                        else {
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
    user = await checkKithCSV(user);
    if (user === 'ERROR') return 'ERROR';

    async function handleCreationResult(result) {
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
                    async function onCaptchaSolved(solvedCaptcha) {
                        logInfo(`[${user.Index}][${user.Email}]` + " | Challenge solved.", true);
                        result = await createAccountAfterCaptcha(proxyConfig, user, result.data.ssid, solvedCaptcha, result.data.authenticity_token);
                        return await handleCreationResult(result);
                    }
                }
            case 'PROXY':
                logError(`[${user.Index}][${user.Email}]` + " | Proxy error, rotating proxy..", true);
                return await registerUser(user, proxies);
            case 'ACCOUNT':
                logError(`[${user.Index}][${user.Email}]` + " | Account already exist.", true);
                notifyDiscordAccountCreation(proxyConfig, 'ERROR', user.Email, user.Password, moduleK.label);
                return 'ERRROR';
            case 'RETRY':
                try { var proxyConfig = getAnotherProxy(proxies); } catch (error) { return 'ERROR'; }
                result = await createAccountAfterCaptcha(proxyConfig, user, result.data.ssid, result.data.solvedCaptcha, result.data.authenticity_token);
                return await handleCreationResult(result);
            case 'CHALLENGE_TOO_LONG':
                logInfo(`[${user.Index}][${user.Email}]` + " | Challenge solve came too late.", true);
                return await solveReCaptcha(siteKey, 'https://eu.kith.com/challenge', onCaptchaSolved);
                async function onCaptchaSolved(solvedCaptcha) {
                    logInfo(`[${user.Index}][${user.Email}]` + " | Challenge solved.", true);
                    result = await createAccountAfterCaptcha(proxyConfig, user, result.data.ssid, solvedCaptcha, result.data.authenticity_token);
                    return await handleCreationResult(result);
                }
            default:
                break;
        }
    }
    try { var proxyConfig = getAnotherProxy(proxies); } catch (error) { return 'ERROR'; }

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
async function checkKithCSV(registerData) {
    if (registerData.FirstName === '' || registerData.LastName === '' || registerData.Country === '' || registerData.Email === '' || registerData.Password === '' || registerData.Address === '' || registerData.PostalCode === '' || registerData.City === '') {
        logError("Missing fields for this line.")
        return 'ERROR';
    }
    if (registerData.FirstName.toLowerCase() == 'random') {
        registerData.FirstName = faker.name.firstName()
    }
    if (registerData.LastName.toLowerCase() == 'random') {
        registerData.LastName = faker.name.lastName()
    }
    if (registerData.Address.toLowerCase() == 'random') {
        registerData.Address = faker.address.streetAddress()
    }
    if (registerData.PostalCode.toLowerCase() == 'random') {
        registerData.PostalCode = faker.address.zipCode()

    }
    if (registerData.City.toLowerCase() == 'random') {
        registerData.City = faker.address.city()
    }
    return registerData
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
