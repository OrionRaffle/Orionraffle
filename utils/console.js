const setTitle = require('node-bash-title');
const chalk = require('chalk');
const clear = require('console-clear');
const figlet = require('figlet');
const inputReader = require('wait-console-input');
const colors = require("colors");
const cliProgress = require('cli-progress');
const fs = require('fs');
//Get package.json data
var pjson = require('../package.json');
const { text } = require('figlet');

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
  clear();
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
/** Get current date
* @author   Lux
*/
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
  logInFile(`[Error]\t: ${message}`);
}
/** Log an info
* @author   Lux
* @param    {String}      message  Message
*/
function logInfo(message, displayDate = false) {
  if (displayDate) message = `${getDate()} - ${message}`;
  console.log(`[Info]\t: ${message}`);
  logInFile(`[Info]\t: ${message}`);
}
/** Log a success
* @author   Lux
* @param    {String}      message  Message
*/
function logSuccess(message, displayDate = false) {
  if (displayDate) message = `${getDate()} - ${message}`;
  console.log(colors.green(`[Success]\t: ${message}`));
  logInFile(`[Success]\t: ${message}`);
}
/** Log a unit test
* @author   Lux
* @param    {String}      file        File of the test
* @param    {String}      func        Function of test
* @param    {String}      line        Line of the test
* @param    {String}      message     Message
* @param    {String}      expectation Expected result
* @param    {String}      result      Result
* @param    {Boolean}     isSame      If the result is supposed to be exactly like expectation
*/
function logUnitTest(file, func, line, message, expectation = '', result = '', isSame = false) {
  message = `${getDate()} - (${file}, ${func}(), line ${line}) \n ${message}`;
  if (expectation !== '' || result !== '') message = `${message}\nExpectation: ${expectation}\nResult: ${result}`;
  if (expectation === result || !isSame) console.log(colors.blue(`[VALIDATED]\t: ${message}`));
  else console.log(colors.orange(`[UNVALIDATED]\t: ${message}`));
}
/** Display a Courir raffle from data
* @author   Lux
* @param    {JSON}      rafflesData  Json object that contains raffle data (name, price and more)
*/
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
/** Display the differents kith modes
* @author   Lux
*/
async function displayKithMode() {
  console.log("1. Account generator");
  console.log("2. Raffle mode (closed)");
  console.log("3. Stock checker\n");

  console.log("0. Back");
  var input = inputReader.readInteger();

  return input;
}
async function displayKithRaffle(rafflesData) {
  let index = 0;
  rafflesData.forEach(raffle => {
    index++;
    console.log(`${index}. ${raffle.title} (${raffle.status} | ${raffle.type})`)
  })
  if (rafflesData.length === 0) {
    logInfo('No raffle.');
    return undefined;
  }
  console.log(`\n0. Back`)
  console.log("\n-----------------------------------------------------\n")
  input = inputReader.readLine();
  return input;
}
async function displayKithRaffleStock(raffle) {
  console.log(`${raffle.title}\n`);
  for (let i = 0; i < raffle.sizes.length; i++) {
    console.log(`${raffle.sizes[i]} : ${raffle.inventory[i]} pieces`);
  }
  await pressToQuit();
  return;
}
async function pressToQuit() {
  console.log("\nPress to quit ---------------------------------------\n")
  input = inputReader.readLine();
  clear();
}
/** Display a recap on what the user is actually doing
* @author   Lux
* @param    {String}      module      Module name
* @param    {String}      mode        Mode (update, register..) (only for courir)
* @param    {String}      raffleName  Raffle name
* @param    {String}      sizeTab     Size tab selected from the user
* @param    {String}      proxyFrom   From X.s to 
* @param    {String}      proxyTo     X. s (ex: 10-30s)
*/
async function displayRecap(module, mode, raffleName, sizeTab, proxyFrom, proxyTo) {
  displayHeader()
  console.log(chalk.rgb(247, 158, 2)(`\n ${module} | ${mode} | ${raffleName}`))
  console.log("----------------------------------------------------------------------\n")
  console.log(`[Settings] Size :`, chalk.rgb(247, 158, 2)(...sizeTab), `| Range : ${proxyFrom} - ${proxyTo} seconds `)
}
/** Update the percent header 
* @author   bstn
* @param    {int}      count          Task achieved
* @param    {int}      length         Total task number
* @param    {int}      successCount   Succes count
*/
async function percent(count, length, successCount) {
  instance = process.cwd()
  instance = instance.split("\\").pop()

  if (length == 0) percentage = 0;
  else percentage = count / length
  setTitle(`OrionRaffle | Instance /${instance} | Private Beta | V.${version} | ${parseInt(percentage * 100)}% | Success : ${successCount} | Failed : ${count - successCount}`);
}
/** Display the size choice
* @author   bstn
* @param    {Array}      sizes    Contains all differents sizes
*/
async function displaySizeChoice(sizes) {
  console.log('Size Available :', chalk.rgb(247, 158, 2)(...sizes));
  console.log('\nFrom size ?');
  from = inputReader.readFloat();
  console.log('To size ?');
  to = inputReader.readFloat();

  return { 'from': from, 'to': to };
}
/** Display the proxy time choice
* @author   bstn
*/
async function displayProxyTimeChoice() {
  console.log('Range between each task ? (First number) (s)');
  from = inputReader.readInteger();
  console.log('Range between each task ? (Second number) (s)');
  to = inputReader.readInteger();

  return { 'from': from, 'to': to };
}
/** Display recaptcha choice
* @author   Lux
*/
async function displayCaptchaChoice() {
  console.log('Enable bypass captcha? (yes/no)');
  var text = inputReader.readLine();
  return (text !== 'yes');
}
/** Display multitasking choice
* @author   Lux
*/
async function displayMultitaskingChoice() {
  console.log('How many tasks do you want to perform in parallel? (ex: 10)');
  var number = inputReader.readInteger();
  return number;
}
/** Display the differents courir modes
* @author   bstn
*/
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
async function displayLydiaSMSCode() {
  console.log("3DSecure Sms code : ");
  const input = inputReader.readLine();
  return input;
}
async function displayLydiaAppCode() {
  console.log("Press when you validated from Lydia App : ");
  inputReader.readLine();
}

async function logInFile(message) {
  fs.appendFile('logs.txt', message + '\n', function (err) {
    if (err) throw err;
  });
}

module.exports = {
  menu,
  displayModule,

  //COURIR
  displayCourirRaffle,
  displayCourirMode,
  //KITH
  displayKithRaffle,
  displayKithRaffleStock,
  displayKithMode,
  //CHOICE
  displaySizeChoice,
  displayProxyTimeChoice,
  displayCaptchaChoice,
  displayMultitaskingChoice,
  //LYDIA
  displayLydiaMode,
  displayLydiaSMSCode,
  displayLydiaAppCode,

  displayRecap,
  percent,
  initProgressBar,
  updateProgressBar,
  pressToQuit,
  logError, logInfo, logSuccess, logUnitTest
}
