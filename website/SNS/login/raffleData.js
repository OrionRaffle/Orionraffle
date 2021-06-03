const rp = require('request-promise-native');
const axios = require('axios');
const figlet = require("figlet")
const colors = require("colors")
const {getSession,getAccessToken,getIdentityId,getCredential,getUserId,getNewAccessToken,getFirstAccessToken} = require('./raffleFunction');
const {getRaffleJSON} = require('./raffleFunction');

let accessKeyId;
let secretKey;
let sessionToken;
let token
let authentificationId
async function raffleData(usercsv){

 
// 1

session = await getSession(usercsv.Email,0);
switch(session){
  case 0:
        return 0;
  case -1: 
        return 0;
  case -2:
    authentificationId = await getFirstAccessToken(usercsv.Email,usercsv.Password,0);
    break;
  default:
    authentificationId = await getAccessToken(usercsv.Email,usercsv.Password,session,0);

}



// console.log(session)


// 2

if(authentificationId == 0 || authentificationId == -1) return 0;
idToken = String(authentificationId.IdToken);
refreshToken = String(authentificationId.RefreshToken);
accessToken = String(authentificationId.AccessToken);


// 3
identityId = await getIdentityId(idToken,0,usercsv.Email);
identityId = String(identityId.IdentityId)
// console.log(identityId)

// 4

credential = await getCredential(idToken,identityId,0,usercsv.Email);
// console.log(credential);
 accessKeyId = String(credential.AccessKeyId);
 expiration = String(credential.Expiration);
 secretKey = String(credential.SecretKey);
 sessionToken = String(credential.SessionToken);

 token = [accessKeyId,secretKey,sessionToken]


 module.exports.token = token;

 


json = await getRaffleJSON(accessKeyId,secretKey,sessionToken,0,usercsv.Email);



return json


}


module.exports = {
    raffleData,
    
    
  };

  