const qs = require('qs')
const request = require('request-promise').defaults({
    jar: true
});
const path = require('path');
const { csvReadProxy, csvRegisterKith } = require(path.join(__dirname, '../../../utils/csvReader'))
const {
    percent,
    displayProxyTimeChoice,
    displayModule,
    logError,
    logInfo,
    logSuccess
} = require(path.join(__dirname, '../../../utils/console'));
const { notifyDiscordAccountCreation } = require(path.join(__dirname, '../../../utils/discord'));
const { sleep, handleProxyError } = require(path.join(__dirname, '../../../utils/utils'));

const moduleK = {
    label: 'Kieth EU'
}

const DEV = false;

//Create Account Function
const createAccount = async (proxyConfig, user) => {
    try {
        const response = await request({
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
        if (response.body.includes('eu.kith.com/challenge')) return 'PROXY';
        // il y a une redirection /register (compte existe déjà)
        if (response.body.includes('eu.kith.com/account/register')) return 'ACCOUNT';
        //Check si l'on est bien sur eu.kith.com cela signifie qu'on est bien connecté / Récupération du sessionId pour accéder aux autres pages
        if (response.body.includes('eu.kith.com/"')) {
            user.sessionId = response.request.headers['cookie'].split(';')[0].split('=')[1]
            return 'SUCCESS';
        }
    } catch (err) {
        if (DEV) console.log(err);
        if (handleProxyError(err) === null) logError('An unexpected error occured.', true);
        return 'PROXY';
    }
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
                'address[zip]': user.Zip,
                'address[phone]': "06" + Math.floor((Math.random() * 90000000) + 10000000)
            })
        })
    } catch (err) {
        if (DEV) console.log(err);
        if (handleProxyError(err) === null) logError('An unexpected error occured.', true);
        return 'ERROR';
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
        const proxyTimes = await getProxyTimes();

        displayModule(moduleK.label);
        var successCount = 0;
        const csvLines = registerData.length;
        for (let i = 0; i < csvLines; i++) {
            await percent(i, csvLines, successCount);
            var res = await registerUser(registerData[i], proxies);
            if(res==='SUCCESS') successCount++;
            await sleep((Math.floor(Math.random() * (proxyTimes.to - proxyTimes.from)) + proxyTimes.from) * 1000);
        }
        logInfo('All CSV lines was read.', true);
        await sleep(2000);
    }
}

async function registerUser(user, proxies) {
    logInfo(`User about to be created : ${user.Email}`, true);
    var proxyConfig = getAnotherProxy(proxies);

    const result = await createAccount(proxyConfig, user);
    switch (result) {
        case 'SUCCESS':
            logSuccess(`Account ${user.Email} successfully created.`, true);
            const uRes = await update(proxyConfig, user);
            if (uRes === 'ERROR') logError(`Address update failed on ${user.Email}`);
            notifyDiscordAccountCreation(proxyConfig, 'SUCCESS', user.Email, user.Password, moduleK.label);
            return 'SUCCESS';
        case 'PROXY':
            logError("Bad proxy : challenge triggered, rotating proxy..", true);
            await registerUser(user, proxies);
            break;
        case 'ACCOUNT':
            logError("Account already exist", true);
            notifyDiscordAccountCreation(proxyConfig, 'ERROR', user.Email, user.Password, moduleK.label);
            break;
        default:
            break;
    }
}
function getAnotherProxy(proxies) {
    if (proxies.length === 0) throw 'No more proxies';
    const proxy = proxies.shift();
    return `http://${proxy.user}:${proxy.password}@${proxy.ip}:${proxy.port}`;
}
async function getProxyTimes() {
    const result = await displayProxyTimeChoice();
    if (result.from <= result.to && result.from >= 0) return result;
    logError('Invalid inputs.')
    await sleep(1500);
    displayModule(moduleK.label);
    return await getProxyTimes();
}
module.exports = {
    register
}


