
const inputReader = require('wait-console-input');
const figlet = require("figlet")
const colors = require("colors")
const clear = require('console-clear');
const setTitle = require('node-bash-title');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const chalk = require('chalk');
var readline = require('readline');
const {footlockerRegister} = require("./footlockerRegister")
const {footlockerRaffle} = require("./footlockerRaffle")
const { csvproxyreader, csvconfigreader } = require('../../init');


colors.enable();



async function menu() {
  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log('\nWelcome ' + `${user}`.magenta)
  console.log("\nFootlocker mode")
  console.log("1 . Raffle Mode")
  console.log("\n2 . Back\n")

  
  return input = inputReader.readLine();

}


colors.enable();



function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}



async function footlocker(version) {


  await sleep(500)

  choix = await menu()

  while (true) {
    // Update Mode
    switch (choix) {
  
      case "1":
        await footlockerRaffle()
        break;
      case "2":
        await footlockerRegister()
        break;
      default:

        
        
    }
    choix = await menu()
  }

}

module.exports = {
 footlocker

}
