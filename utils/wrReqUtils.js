var async = require('async');
var fetchCookiesFromReportsUrl = require('./wbesUtils').fetchCookiesFromReportsUrl;
var ISGSRequisitionUrl = require('./wbesUtils').ISGSRequisitionUrl;
var CSVFetcher = require('./csvFetcher');
var defaultRequestOptions = require('./wbesUtils').defaultRequestOptions;
var baseUrl = require('./wbesUtils').baseUrl;
var StringUtils = require('./stringUtils');

var getUtilISGSTotalReq = module.exports.getUtilISGSReq = function (utilId, date_str, rev, isSeller, callback) {
    // http://scheduling.wrldc.in/wbes/Report/GetRldcData?isBuyer=false&utilId=f9b9e90c-1380-4eb1-bb00-8a0ea85f059c&regionId=2&scheduleDate=29-11-2018&revisionNumber=65&byOnBar=0
    // fetch cookie first and then do request
    async.waterfall([
        function (callback) {
            fetchCookiesFromReportsUrl(function (err, cookieObj) {
                if (err) {
                    return callback(err);
                }
                return callback(null, cookieObj);
            });
        }
    ], function (error, cookieObj) {
        if (error) {
            return callback(err);
        }
        var options = defaultRequestOptions;

        var tokenString = new Date().getTime();
        var cookieString = "";
        cookieString += cookieObj[0];
        // options.headers.cookie = cookieString;
        console.log("Cookie String for buyer isgs requisitions is " + cookieString);
        var templateUrl = ISGSRequisitionUrl;

        options.url = StringUtils.parse(templateUrl, baseUrl, !isSeller, utilId, date_str, rev);
        console.log("ISGS Requisitions JSON fetch url created is " + options.url);

        // get the requisitions Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var isgsReqArray = JSON.parse(resBody)['jaggedarray'];

            // Since we need total requisition of the seller or buyer. Hence, we will take the "grand total"/last column of the array from rows 2 to 97
            // find the width of the array
            var arrayWidth = isgsReqArray[0].length;
            var reqVals = [];
            for (let reqRowIter = 2; reqRowIter < 97; reqRowIter++) {
                reqVals.push(+isgsReqArray[reqRowIter][arrayWidth - 1]);
            }
            callback(null, reqVals);
        });
    });
};