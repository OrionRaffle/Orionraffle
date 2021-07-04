//Modules import
const path = require('path')
const colors = require('colors')

const { SNS } = require('./website/SNS/SNS')
const { shuzu } = require('./website/Shuzu/ShuzuLab')
const { kith } = require('./website/KithEU/kithRaffle')
// const { footlocker } = require('./website/FootLocker/FootLocker')
const { courir, syncCourir } = require('./website/CourirOnline/courir')
const { footshop } = require('./website/Footshop/footshop')
const { courirInstore } = require('./website/CourirInstore/courirInstore')

//Ourself Modules import
const { csvReadClientAuth } = require(path.join(__dirname, 'utils/csvReader'))
const { checkVersion } = require(path.join(__dirname, 'utils/update'));
const { authUser } = require(path.join(__dirname, './utils/authentification'))
const { menu, logError, logInfo, logSuccess } = require(path.join(__dirname, 'utils/console'))
const { sleep } = require(path.join(__dirname, 'utils/utils'))
const { setRichPresence } = require(path.join(__dirname, 'utils/discord'));

const Module = require(path.join(__dirname, 'metier/Module'));

//Get package.json data
var pjson = require('./package.json');

const version = pjson.version;
let discordUsername;

//All modules availables
const allModules = [
  new Module('SNS', SNS, true),
  new Module('Footshop', footshop, false),
  new Module('Courir Online', syncCourir, true),
  new Module('Courir Instore', courirInstore, true),
  //new Module('ShuzuLab', shuzu, false),
  new Module('Kith EU', kith, true)
]

async function main() {
  async function rejected(error) {
    logError(error);
    await sleep(5000)
    process.exit(1)
  }
  async function databaseAuthentification(data) {
    await authUser(data.LicenceKey, version, rejected, authAccepted);
  }
  async function authAccepted(user) {
    discordUsername = user;
    await checkVersion(version, versionUpToDate);
  }
  async function versionUpToDate() {
    await displayMenu();
  }
  async function displayMenu() {
    choice = await menu(allModules, discordUsername);
    choice = parseInt(choice);
    if (isNaN(choice) || choice>allModules.length || choice<1) logError('Wrong input.');
    else{
      choice--;
      if (allModules[choice].state){
        try {
          await allModules[choice].callback(version, allModules[choice]);
        } catch (error) {
          logError('An error occured.'+error);
        }
      }
      else logError('Module down.');
    }
    await sleep(1500);
    await displayMenu();
  }
  await csvReadClientAuth(databaseAuthentification);
}

setRichPresence(version)
colors.enable()
main()
//courir(version, allModules[2])