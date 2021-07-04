// const { login } = require('./login/loginFunction')
const {raffleKith } = require('./stockChecker/stockChecker')
const path = require('path');
const {
  menu,
  displayKithRaffle,
  displayKithRaffleStock,
  displayModule,
  logError,
  logInfo,
  logSuccess
} = require(path.join(__dirname, '../../utils/console'))

const moduleK = {
  label: 'Kith EU'
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}

async function kith(){
  await stockChecker();

  await sleep(50000000)

}

async function stockChecker() {
  const raffleTab = await raffleKith();
  displayModule(moduleK.label);
  var choice = await displayKithRaffle(raffleTab);
  while(choice<1 || choice>raffleTab.length){
    logError('Invalid input.');
    displayModule(moduleK.label);
    choice = await displayKithRaffle(raffleTab);
  }
  displayModule(moduleK.label);
  await displayKithRaffleStock(raffleTab[choice-1]);
}


kith()
module.exports = {
  kith
}