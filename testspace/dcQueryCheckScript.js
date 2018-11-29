var wbesHelper = require('../dbHelpers/wbesHelper');

var queryParams = {
    wbes_entity: ["MOUDA"],
    wbes_metric : ["requisition"]
};

wbesHelper.handleWbesQuery(queryParams, function (err, res) {
    if (err) {
        console.log(err);
    }
    console.log(res);
});