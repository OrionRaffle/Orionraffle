/** Set discord overlay for Orion
* @author   bstn
*/
function setRichPresence(version) {
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
    } catch(error) {
      console.log(error)
      process.exit(1)
    }
}

module.exports = {
    setRichPresence
}