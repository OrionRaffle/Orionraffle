//Modules import
const path = require('path')
const { spawn } = require('child_process');

const { menu, logError, logInfo, logSuccess } = require(path.join(__dirname, 'console'))


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

module.exports = {
    sleep,
    reinitProgram
}