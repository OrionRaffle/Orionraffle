/** Await for x ms of time
* @author   bstn
* @param    {int} ms           ms to wait
*/
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
    sleep
}