const path = require('path');
const axios = require('axios-https-proxy-fix');
const {
    handleProxyError
} = require('../../utils/utils');

async function getIp(proxyconfig) {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://api.ipify.org?format=json',
            proxy: proxyconfig,
            timeout: 10000,
        });
        return response.data.ip;
    }
    catch (err) {
        const handle = handleProxyError(err);
        if (handle === null) {
            return logError(`Unknow error, open a ticket please.\nError:${err}`, true);
        }
    }
}

module.exports = {
    getIp
}