/**
 * Created by Nagasudhir on 26 Jun 2019.
 */
const makeTwoDigits = require('./stringUtils').makeTwoDigits;
var convertDateObjToSpeechDate = module.exports.convertDateObjToSpeechDate = function (dateObj) {
    if (dateObj != undefined && dateObj != null && typeof dateObj.getDate == 'function') {
        const dateStr = `${dateObj.getFullYear()}-${makeTwoDigits(dateObj.getMonth()+1)}-${makeTwoDigits(dateObj.getDate()+1)}`
        return dateStr;
    }
    return dateObj;
};