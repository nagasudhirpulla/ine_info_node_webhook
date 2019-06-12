var handleQuery = require('../dbHelpers/shareAllocHelper').handleQuery;

const queryParams = { 'wbes_entity': ["GADARWARA"], "constituent_entity": ["CHHATTISGARH"] }
handleQuery(queryParams, function (err, reqVals) {
    if (err) {
        return console.log(err);
    }
    console.log(reqVals);
});
