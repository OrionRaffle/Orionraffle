const host = '185.31.40.53';
const user = 'orion';
const password = '785421BG';
const database = 'orion_user';
const storageUrl = 'http://orionraffle-download.alwaysdata.net/OrionRaffle-'

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;

module.exports = {
    host,
    user,
    password,
    database,
    storageUrl
}