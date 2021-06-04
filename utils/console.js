const setTitle = require('node-bash-title')
const chalk = require('chalk')
const clear = require('console-clear')
const figlet = require('figlet')
const inputReader = require('wait-console-input')

const logo = chalk.rgb(247, 158, 2)(
  figlet.textSync(' Orion', {
    font: 'Larry 3D',
    horizontalLayout: 'fitted',
  })
)
async function display() { // A quoi ça sert?
    displayHeader()
    console.log(`\nWelcome ${`${discordUsername}`.magenta}`)
    setTitle(`OrionRaffle | Private Beta | V.${version} | ${discordUsername}`)
}
/** Display header logo (Orion)
* @author   bstn
*/
function displayHeader() {
  clear()
  console.log(logo)
}
/** Display header logo (Orion)
* @author   bstn
* @param    {Array}       modules   All created modules
* @param    {String}      username  Username
*/
async function menu(modules, username) {
  displayHeader();
  console.log(`\nWelcome ${`${username}`.magenta}`);
  console.log('\n');
  let i = 1;
  modules.forEach((mod) => {
    console.log(`${i} . ${mod.label} ${(mod.state ? '' : '(Maintenance)')}`);
    i++;
  })
  input = inputReader.readLine();
  return input;
}

/** Log an error
* @author   Lux
* @param    {String}      message  Message
*/
function logError(message) {
  console.log(`[Error]\t: ${message}`);
}
/** Log an info
* @author   Lux
* @param    {String}      message  Message
*/
function logInfo(message) {
  console.log(`[Info]\t: ${message}`);
}
/** Log a success
* @author   Lux
* @param    {String}      message  Message
*/
function logSuccess(message) {
  console.log(`[Success]\t: ${message}`);
}

module.exports = {
  menu,
  logError, logInfo, logSuccess
}
