

async function validationCourirRegister(account) {
    return (
        (account.Email === "") 
        || (account.Password === "") 
        || (account.FirstName === "") 
        || (account.LastName === "") 
        || (account.Country === "") 
        || (account.Address === "") 
        || (account.PostalCode === "") 
        || (account.City === "") 
        || (account.State === "") 
        || (account.CardNumber === "") 
        || (account.MM === "") 
        || (account.YY === "") 
        || (account.CVC === "")
        );
}

module.exports = {
    validationCourirRegister
}