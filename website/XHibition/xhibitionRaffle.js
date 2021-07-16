// const { login } = require('./login/loginFunction')
const { raffleXhibition } = require('./raffle/raffleFunction')
const { getDataRaffle } = require('./stockChecker/stockChecker')
const { register } = require('./register/registerFunction')
const path = require('path');
const {
  menu,
  displayKithRaffle,
  displayKithRaffleStock,
  displayXhibitionMode,
  displayModule,
  logError,
  logInfo,
  logSuccess,
  displayXhibitionRaffle
} = require('../../utils/console')

const moduleK = {
  label: 'Xhibition'
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function xhibition() {
  displayModule(moduleK.label)
  var choice = await displayXhibitionMode();
  while (choice < 0 || choice > 3) {
    logError('Invalid input');
    await sleep(1000);
    choice = await displayXhibitionMode();
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

    default:
      break;
  }
  await xhibition();
}

async function generator() {
  
  await register();
}

async function raffle(raffleTab) {
  if (raffleTab === undefined) raffleTab = await getDataRaffle();
  displayModule(moduleK.label);
  var choice = await displayXhibitionRaffle(raffleTab);
  while (choice < 0 || choice > raffleTab.length) {
    logError('Invalid input.');
    displayModule(moduleK.label);
    choice = await displayXhibitionRaffle(raffleTab);
  }
  displayModule(moduleK.label);
  if (choice === '0') return;

  // await raffleKith(raffleTab[choice - 1])
}

module.exports = {
  xhibition
}