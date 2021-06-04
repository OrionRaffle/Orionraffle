/** Set discord overlay for Orion
* @author   bstn
*/
function setRichPresence() {
    try {
        const client = require('discord-rich-presence')('812828492474613780')
        client.on('unhandledRejection', () => {
          rpc_client = null
        })
        client.on('error', () => {
          rpc_client = null
        })
        client.updatePresence({
          details: `Version: ${version}`,
          startTimestamp: Date.now(),
          largeImageKey: 'orionlogoverybig',
          instance: true,
        })
    } catch {}
}

module.exports = {
    setRichPresence
}