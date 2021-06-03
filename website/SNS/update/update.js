const SMSActivate = require('sms-activate')
const colors = require('colors')
const { load } = require('npm')
const {
  getAccountData,
  getUserId,
  getNewAccessToken,
} = require('../login/loginFunction')
const {
  addAddress,
  addCreditCard,
  addNumber,
  sendSMS,
  sendCode,
  getVerified,
  removeAddress,
  getAdyenLink,
  getClientKey,
  getConversationId,
  getTokens,
} = require('./updateFunction')
const token = require('../login/login')

const { getSession, getAccessToken } = require('../login/loginFunction')

function pad(num) {
  return `0${num}`.slice(-2)
}

async function date() {
  const date_ob = new Date()
  const seconds = date_ob.getSeconds()
  const minutes = date_ob.getMinutes()
  const hour = date_ob.getHours()

  // prints date & time in YYYY-MM-DD format
  return `[${pad(hour)}:${pad(minutes)}:${pad(seconds)}]`
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function addNumberFunction(
  usercsv,
  proxy,
  accessKeyId,
  secretKey,
  sessionToken,
  SMSActivateAPI,
  num
) {
  dataAddress = await getAccountData(
    accessKeyId,
    secretKey,
    sessionToken,
    proxy,
    usercsv.Email
  )
  console.log(
    colors.green(
      await date(),
      `[${num}] [${usercsv.Email}] Removing all addresses`
    )
  )
  for (i in dataAddress.Addresses) {
    await removeAddress(
      accessKeyId,
      secretKey,
      sessionToken,
      usercsv,
      proxy,
      dataAddress.Addresses[i].id
    )
    await sleep(1000)
  }

  backupCountry = usercsv.Country
  usercsv.Country = 'FR'
  erreur = await addAddress(
    accessKeyId,
    secretKey,
    sessionToken,
    usercsv,
    proxy
  )
  if (erreur == 0 || erreur == -1) return erreur
  usercsv.Country = backupCountry

  const sms = new SMSActivate(SMSActivateAPI)

  data = await sms.getNumber('sf')

  while (data == 'no_numbers') {
    console.log('[Error] No Numbers at the moment, waiting')
    await sleep(60000)
    data = await sms.getNumber('sf')
  }
  if (data == null) return -3

  const id = data.id
  const phoneNumber = `+${data.number}`

  await sleep(2000)
  await addNumber(
    accessKeyId,
    secretKey,
    sessionToken,
    proxy,
    usercsv,
    phoneNumber
  )
  await getAccountData(
    accessKeyId,
    secretKey,
    sessionToken,
    proxy,
    usercsv.Email
  )
  await getUserId(accessToken.accessToken, proxy, usercsv.Email)

  token1 = await getNewAccessToken(refreshToken, proxy, usercsv.Email)

  await sleep(500)
  newAccessToken = token1.AccessToken

  await sleep(2000)
  await sendSMS(proxy, usercsv, phoneNumber, newAccessToken)
  // await sms.setStatus(id, 1)

  console.log(
    colors.green(await date(), `[${num}] [${usercsv.Email}] Waiting code`)
  )
  let code = null
  let attempt = 0
  while (code == null) {
    if (attempt == 10) {
      console.log(
        colors.white(
          await date(),
          `[${num}] [${usercsv.Email}] Change phone number`
        )
      )
      await sms.setStatus(id, 8)
      await sleep(2000)

      return -2
    }
    await sleep(10000)
    code = await sms.getCode(id)
    attempt++
  }

  await sms.setStatus(id, 6)
  erreur = await sendCode(proxy, usercsv, phoneNumber, newAccessToken, code)
  if (erreur == 0 || erreur == -1) return erreur
  await getVerified(accessKeyId, secretKey, sessionToken, proxy)
  return 1
}

async function update(usercsv, proxy, SMSActivateAPI, num) {
  accessKeyId = token.token[0]
  secretKey = token.token[1]
  sessionToken = token.token[2]

  await sleep(500)

  if (usercsv.AddNumber === 'true') {
    erreur = await addNumberFunction(
      usercsv,
      proxy,
      accessKeyId,
      secretKey,
      sessionToken,
      SMSActivateAPI,
      num
    )
    if (erreur == 0 || erreur == -1) return erreur
    if (erreur == -2) {
      while (erreur == -2) {
        erreur = await addNumberFunction(
          usercsv,
          proxy,
          accessKeyId,
          secretKey,
          sessionToken,
          SMSActivateAPI,
          num
        )
      }
    }
    if (erreur == -3) {
      // No key or bad key
      console.log('[Error] SMS Activate API Key not valid')
      console.log('[Error] Please reboot the bot')
      await sleep(10000000)
    }
    console.log(
      colors.green(
        await date(),
        `[${num}] [${usercsv.Email}] Adding number with success`
      )
    )
  }

  await sleep(1500)

  if (usercsv.AddAddress === 'true') {
    erreur = await addAddress(
      accessKeyId,
      secretKey,
      sessionToken,
      usercsv,
      proxy
    )
    if (erreur == 0 || erreur == -1) return erreur
    console.log(
      colors.green(
        await date(),
        `[${num}] [${usercsv.Email}] Adding address with success`
      )
    )
  }

  await sleep(1500)

  // erreur = await addNumber(accessKeyId,secretKey,sessionToken,usercsv,proxy)

  if (usercsv.AddCC == 'true') {
    // link = await getAdyenLink(accessKeyId,secretKey,sessionToken,usercsv,proxy)
    // clientKey = await getClientKey(link)
    // console.log(clientKey)
    // conversationId = await getConversationId(clientKey)
    // await getTokens(clientKey, conversationId, usercsv, link)
    erreur = await addCreditCard(accessKeyId, secretKey, sessionToken, usercsv, proxy)
    if (erreur == 0 || erreur == -1) return erreur;
    console.log(colors.green(await date(),`[${  num  }] [${  usercsv.Email  }] Adding credit card with success`))
  }

  await sleep(5000000)
}

module.exports = {
  update,
}
