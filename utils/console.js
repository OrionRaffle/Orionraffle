const setTitle = require('node-bash-title');
const chalk = require('chalk');
const clear = require('console-clear');
const figlet = require('figlet');
const inputReader = require('wait-console-input');
const colors = require("colors");
const cliProgress = require('cli-progress');

//Get package.json data
var pjson = require('../package.json');

const version = pjson.version;
var progressBar = null;

function initProgressBar() {
  progressBar = new cliProgress.SingleBar({
    format: 'Task completion |' + '{bar}' + '| {percentage}% || {value}/{total} task made',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
}
function updateProgressBar(made, total) {
  progressBar.update(
    parseInt(made / total * 100),
    {
      percentage: parseInt(made / total * 100),
      value: made,
      total: total
    });
}

const logo = chalk.rgb(247, 158, 2)(
  figlet.textSync(' Orion', {
    font: 'Larry 3D',
    horizontalLayout: 'fitted',
  })
)
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
  console.log(chalk.rgb(247, 158, 2)(`\n ${module} ${raffle !== undefined ? `| ${raffle.name}` : ''}`));
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
function getDate() {
  const date = new Date();
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}
/** Log an error
* @author   Lux
* @param    {String}      message  Message
*/
function logError(message, displayDate = false) {
  if (displayDate) message = `${getDate()} - ${message}`;
  console.log(colors.brightRed(`[Error]\t: ${message}`));
}
/** Log an info
* @author   Lux
* @param    {String}      message  Message
*/
function logInfo(message, displayDate = false) {
  if (displayDate) message = `${getDate()} - ${message}`;
  console.log(`[Info]\t: ${message}`);
}
/** Log a success
* @author   Lux
* @param    {String}      message  Message
*/
function logSuccess(message, displayDate = false) {
  if (displayDate) message = `${getDate()} - ${message}`;
  console.log(`[Success]\t: ${message}`);
}

async function displayCourirRaffle(rafflesData) {
  let index = 0;
  rafflesData.forEach(raffle => {
    index++;
    console.log(`${index}. ${raffle.name} / ${raffle.price}€`)
  })
  if (rafflesData.length === 0) {
    logInfo('No raffle.')
    return undefined
  }
  console.log("\n-----------------------------------------------------\n")
  input = inputReader.readLine();
  return input;
}
async function displayRecap(module, mode, raffleName, sizeTab, proxyFrom, proxyTo) {
  displayHeader()
  console.log(chalk.rgb(247, 158, 2)(`\n ${module} | ${mode} | ${raffleName}`))
  console.log("----------------------------------------------------------------------\n")
  console.log(`[Settings] Size :`, chalk.rgb(247, 158, 2)(...sizeTab), `| Range : ${proxyFrom} - ${proxyTo} seconds `)
}

async function percent(count, length, successCount) {
  instance = process.cwd()
  instance = instance.split("\\").pop()

  if (length == 0) percentage = 0;
  else percentage = count / length
  setTitle(`OrionRaffle | Instance /${instance} | Private Beta | V.${version} | ${parseInt(percentage * 100)}% | Success : ${successCount} | Failed : ${count - successCount}`);
}

async function displaySizeChoice(sizes) {
  console.log('Size Available :', chalk.rgb(247, 158, 2)(...sizes));
  console.log('\nFrom size ?');
  from = inputReader.readFloat();
  console.log('To size ?');
  to = inputReader.readFloat();

  return { 'from': from, 'to': to };
}
async function displayProxyTimeChoice() {
  console.log('Range between each task ? (First number) (s)');
  from = inputReader.readInteger();
  console.log('Range between each task ? (Second number) (s)');
  to = inputReader.readInteger();

  return { 'from': from, 'to': to };
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
async function displayLydiaMode() {
  displayHeader();
  console.log(chalk.rgb(247, 158, 2)("3D Secure authentification - Lydia"));
  console.log("-----------------------------------------------------\n");
  console.log("1. SMS Code");
  console.log("2. Lydia App");
  console.log('\n-----------------------------------------------------\n');
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
  displayLydiaMode,
  displayRecap,
  percent,
  initProgressBar,
  updateProgressBar,
  logError, logInfo, logSuccess,
}
