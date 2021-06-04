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
/** Display module vue
* @author   bstn
* @param    {String}      module  Module name
*/
function displayModule(module, raffle) {
  clear();
  displayHeader();
  console.log(chalk.rgb(247, 158, 2)(`\n ${module} ${raffle!==undefined?`| ${raffle.name}`:''}`));
  console.log("-----------------------------------------------------\n");
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

async function displayCourirRaffle(rafflesData) {
  let index = 0;
  rafflesData.forEach(raffle => {
    index++;
    console.log(`${index}. ${raffle.name} / ${raffle.price}€`)
  })
  console.log("\n-----------------------------------------------------\n")
  input = inputReader.readLine();
  return input;
}
async function displaySizeChoice(sizes) {
  console.log('Size Available :', chalk.rgb(247, 158, 2)(...sizes));
  console.log('\nFrom size ?');
  from = inputReader.readFloat();
  console.log('To size ?');
  to = inputReader.readFloat();

  return {'from':from, 'to':to};
}
async function displayProxyTimeChoice() {
  console.log('Range between each task ? (First number) (s)');
  from = inputReader.readInteger();
  console.log('Range between each task ? (Second number) (s)');
  to = inputReader.readInteger();

  return {'from':from, 'to':to};
}

async function displayCourirMode() {
  displayHeader();
  console.log("-----------------------------------------------------\n")
  console.log("1. Account Register + Raffle Mode")
  console.log("2. Account Login + Raffle Mode")
  console.log('\n-----------------------------------------------------\n')
  var input = inputReader.readInteger();

  return input;
}

module.exports = {
  menu,
  displayModule,
  displayCourirRaffle,
  displaySizeChoice,
  displayProxyTimeChoice,
  displayCourirMode,

  logError, logInfo, logSuccess,
}
