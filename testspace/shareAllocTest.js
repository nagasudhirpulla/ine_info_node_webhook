// var handleQuery = require('../dbHelpers/shareAllocHelper').handleQuery;

const queryParams = { 'wbes_entity': ["GADARWARA"], "constituent_entity": ["CHHATTISGARH"] }
// handleQuery(queryParams, function (err, reqVals) {
//     if (err) {
//         return console.log(err);
//     }
//     console.log(reqVals);
// });

const shareAllocInfo = require('../dbHelpers/shareAllocInfoHelper');
shareAllocInfo.initShareAllocInfoAppState(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(JSON.stringify(data));
    shareAllocInfo.handleQuery(queryParams, function (err, reqVals) {
        if (err) {
            return console.log(err);
        }
        console.log(reqVals);
    });   
    
    shareAllocInfo.handleQueryForBeneficiaryinfo(queryParams, function (err, reqVals) {
        if (err) {
            return console.log(err);
        }
        console.log(reqVals);
    });
});