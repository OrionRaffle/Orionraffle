//Modules import
const path = require('path')

const { menu, logError, logInfo, logSuccess } = require('./console')


/** Await for x ms of time
* @author   bstn
* @param    {int} ms           ms to wait
*/
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
/** Await for x ms of time
* @author   Lux
* @param    {String} error           Error
*/
async function reinitProgram(error) {
    logError(error);
    await sleep(5000);
}

async function handleProxyError(err) {
    if (err.code === 'ENOTFOUND'
        || err.code === 'ECONNREFUSED'
        || err.code === 'ENOENT'
        || err.code === 'ECONNABORTED'
        || err.code === 'ECONNRESET') return logError('Proxy error.', true);
    else if (err.code === 'ERR_SOCKET_CLOSED') return logError('Proxy does not exist.', true);
    else if (err.response !== undefined){
        if (err.response.status === '407') return logError('Proxy error.', true);
        else if (err.response.status === '502') return logError('Proxy too slow.', true);
        else return null;
    }
    else return null;
}

module.exports = {
    sleep,
    reinitProgram,
    handleProxyError
}