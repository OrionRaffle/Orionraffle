// const { login } = require('./login/loginFunction')

const path = require('path');
const {
  displayDSMLMode,
  displayModule,
  logError,
  logInfo,
  logSuccess,
  displayXhibitionRaffle
} = require('../../utils/console')

const {raffleDSML} = require('./Raffle/raffleFunction')
const moduleK = {
  label: 'DSML'
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function dsml() {
  displayModule(moduleK.label)
  var choice = await displayDSMLMode();
  while (choice < 0 || choice > 3) {
    logError('Invalid input');
    await sleep(1000);
    choice = await displayDSMLMode();
  }
  switch (choice) {
    case 0:
      return;
    case 1:
      await raffle();
      break;

    default:
      break;
  }
  await dsml();
}




async function raffle(raffleTab) {
  await raffleDSML(null)
}

module.exports = {
  dsml
}