// const { login } = require('./login/loginFunction')
const { raffleKith } = require('./stockChecker/stockChecker')
const { register } = require('./register/registerFunction')
const path = require('path');
const {
  menu,
  displayKithRaffle,
  displayKithRaffleStock,
  displayKithMode,
  displayModule,
  logError,
  logInfo,
  logSuccess
} = require(path.join(__dirname, '../../utils/console'))

const moduleK = {
  label: 'KithEU'
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function kith() {
  displayModule(moduleK.label)
  var choice = await displayKithMode();
  while (choice < 0 || choice > 3) {
    logError('Invalid input');
    await sleep(1000);
    choice = await displayKithMode();
  }
  switch (choice) {
    case 0:
      return;
    case 1:
      await generator();
      break;
    case 2:
      await raffle();
      break;
    case 3:
      await stockChecker();
      break;
    default:
      break;
  }
  await kith();
}

async function generator() {
  await register();
}

async function raffle() {

}

async function stockChecker(raffleTab) {
  if (raffleTab === undefined) raffleTab = await raffleKith();
  displayModule(moduleK.label);
  var choice = await displayKithRaffle(raffleTab);
  while (choice < 0 || choice > raffleTab.length) {
    logError('Invalid input.');
    displayModule(moduleK.label);
    choice = await displayKithRaffle(raffleTab);
  }
  displayModule(moduleK.label);
  if (choice === '0') return;
  if (raffleTab[choice - 1].type === 'Instore') {
    logInfo('Stock are not available for Instore raffles.');
    await sleep(2000);
  }
  else await displayKithRaffleStock(raffleTab[choice - 1]);
  await stockChecker(raffleTab);
}

module.exports = {
  kith
}