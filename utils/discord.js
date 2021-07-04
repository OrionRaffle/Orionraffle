const { Webhook, MessageBuilder } = require('discord-webhook-node');
const { csvReadClientAuth } = require('./csvReader')

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
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
async function notifyDiscordAccountCreation(proxy, state, email, password, moduleName) {
  if (state == "SUCCESS") {
    color = '#18cc36';
    message = 'Account creation succeed on ';
  }
  else {
    message = 'Account creation failed on ';
    color = '#EE2016';
  }
  await csvReadClientAuth(send);

  async function send(authCsv) {
    if (authCsv.webhook === '') return;
    const hook = new Webhook(authCsv.webhook);

    var link = '';
    if (moduleName === 'Kith EU') link = 'https://www.google.com/search?q=kith+eu&client=firefox-b-d&sxsrf=ALeKk02tsoRvKl8ESYm8Nm3gG8y2ylC2Eg:1625396182792&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj1teDQoMnxAhVRxoUKHVzHAKoQ_AUoA3oECAEQBQ&biw=1536&bih=739#imgrc=e2m2Mp9-7u-9yM';

    const embed = new MessageBuilder()
      .setAuthor('OrionRaffle')
      .setTitle(message + moduleName)
      .addField('Email', `${email}`, true)
      .addField('Password', `||${password}||`, true)
      .addField('Proxy', `||${proxy}||`, true)
      .setColor(color)
      .setThumbnail(link)
      .setFooter('OrionRaffle', "https://gblobscdn.gitbook.com/spaces%2F-MU-J_1ng5obqnzK3YrK%2Favatar-1614016542368.png?alt=media")
      .setTimestamp();
    try {
      hook.send(embed);
    } catch { }
  }
}

module.exports = {
  setRichPresence,
  notifyDiscordAccountCreation
}