/*
Email,Password,FirstName,LastName,Country,Address,Address2,PostalCode,City,State,CardNumber,MM,YY,CVC
,POKEMON1e,Romane,Fernandez,FR,117bis Rue de la Cartoucherie,,63000,Clermont-Ferrand,ARA,4165981501908309,09,2025,418
*/

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validateCountry(country) {
    const re = /^[A-Z]{2}$/;
    return re.test(String(country))
}
function validateCardNumber(number) {
    const reVisa = /^4[0-9]{12}(?:[0-9]{3})?$/;
    const reMastercard = /^4[0-9]{12}(?:[0-9]{3})?$/;
    return (reVisa.test(String(number)) && reMastercard.test(String(number)));
}
function validateCVC(cvc) {
    const re = /^[0-9]{3}$/;
    return re.test(String(cvc))
}
function validateDate(yy,mm,dd) {
    const reYY = /^20[0-9]{2}$/;
    const reMM = /^[0-1][0-2]$/;
    const reDD = /^[0-3][0-9]$/;
    return reYY.test(String(yy)) && reMM.test(String(mm)) && reDD.test(String(dd));
}
function validateString(string) {
    return string !== '';
}