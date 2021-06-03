const colors = require('colors')
const {
  getSession,
  getAccessToken,
  getIdentityId,
  getCredential,
  getUserId,
  getNewAccessToken,
  getFirstAccessToken,
} = require('./loginFunction')
const {
  getRaffleData,
  getAccountData,
} = require('./loginFunction')

let accessKeyId
let secretKey
let sessionToken
let token
let authentificationId
async function login(usercsv, proxy) {
  // 1

  session = await getSession(usercsv.Email, proxy)
  switch (session) {
    case 0:
      return session
    case -1:
      return session
    case -2:
      authentificationId = await getFirstAccessToken(
        usercsv.Email,
        usercsv.Password,
        proxy
      )
      break
    default:
      authentificationId = await getAccessToken(
        usercsv.Email,
        usercsv.Password,
        session,
        proxy
      )
  }

  // console.log(session)

  // 2

  if (authentificationId == 0 || authentificationId == -1)
    return authentificationId
  idToken = String(authentificationId.IdToken)
  refreshToken = String(authentificationId.RefreshToken)
  accessToken = String(authentificationId.AccessToken)

  // 3
  identityId = await getIdentityId(idToken, proxy, usercsv.Email)
  if (identityId == 0 || identityId == -1) return identityId
  identityId = String(identityId.IdentityId)
  // console.log(identityId)

  // 4

  credential = await getCredential(idToken, identityId, proxy, usercsv.Email)
  if (credential == 0 || credential == -1) return credential
  // console.log(credential);
  accessKeyId = String(credential.AccessKeyId)
  expiration = String(credential.Expiration)
  secretKey = String(credential.SecretKey)
  sessionToken = String(credential.SessionToken)

  token = [accessKeyId, secretKey, sessionToken]

  module.exports.token = token

  // 5
  user = await getUserId(accessToken, proxy, usercsv.Email)
  if (user == 0 || user == -1) return user
  username = String(user.Username)

  // 6

  newtoken = await getNewAccessToken(refreshToken, proxy, usercsv.Email)
  if (newtoken == 0 || newtoken == -1) return newtoken
  NewidToken = String(authentificationId.IdToken)

  // 7 Get Method / Raffle Data
  raffle = await getRaffleData(
    accessKeyId,
    secretKey,
    sessionToken,
    proxy,
    usercsv.Email
  )
  if (raffle == 0 || raffle == -1) return raffle

  // 8 Get Method / AccountData

  account = await getAccountData(
    accessKeyId,
    secretKey,
    sessionToken,
    proxy,
    usercsv.Email
  )
  if (account == 0 || account == -1) return account
  userId = String(account.id)
  edgeId = String(account.edgeId)

  if (usercsv.AddNumber == 'true' && usercsv.AddAddress == 'false') {
    console.log(
      colors.brightRed(
        `[${  usercsv.Email  }] You can't add a number, if addAddress is false`
      )
    )
    return 0
  }

  if (
    usercsv.AddNumber == 'false' &&
    usercsv.AddAddress == 'false' &&
    usercsv.AddCC == 'true' &&
    (account.verifiedPhone == 'false' || account.Addresses == '')
  ) {
    console.log(
      colors.brightRed(
        `[${ 
          usercsv.Email 
          }] You can't add a CC, if you do not have an address and verified phone number`
      )
    )
    return 0
  }
  // if(account.Addresses)

  // await iterableUpdate(usercsv.Email);

  // await IterableventTrack(usercsv.Email,userId,edgeId)
}

module.exports = {
  login,
}
