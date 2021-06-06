const { login } = require('./login/loginFunction')
const { kithraffle } = require('./kithRaffleFunction')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}

async function kith(){
  await kithraffle()

  await sleep(50000000)

}

module.exports = {
  kith
}