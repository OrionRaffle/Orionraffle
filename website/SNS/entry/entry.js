const rp = require('request-promise-native')
const axios = require('axios')
const colors = require('colors')
const {
  entryRaffle,
  getRaffleDataAdvanced,
  IterableventTrackRaffle,
} = require('./entryFunction')
const token = require('../login/login')
const { getAccountData } = require('../login/loginFunction')

async function entry(usercsv, proxy, idRaffle, size) {
  accessKeyId = token.token[0]
  secretKey = token.token[1]
  sessionToken = token.token[2]

  account = await getAccountData(accessKeyId, secretKey, sessionToken, proxy)
  if (account == 0 || account == -1) return account
  if (account.Payment == null) {
    console.log(colors.brightRed(`[${usercsv.Email}] entry error`))
    console.log('[Info] Waiting for the next task')
    return 0
  }
  idPayment = String(account.Payment.id)

  for (const i in account.Addresses) {
    if (account.Addresses[i].isDefault) {
      if (account.Addresses[i].id == 0) return 0
      idAddress = account.Addresses[i].id
    }
  }

  raffle = await entryRaffle(
    accessKeyId,
    secretKey,
    sessionToken,
    usercsv,
    idPayment,
    idAddress,
    proxy,
    size,
    idRaffle
  )
  if (raffle == 0 || raffle == -1) return raffle
}
module.exports = {
  entry,
}
