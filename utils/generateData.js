
function getPhoneNumber() {
    return "+336" + Math.floor((Math.random() * 90000000) + 10000000);
}

module.exports = {
    getPhoneNumber
}