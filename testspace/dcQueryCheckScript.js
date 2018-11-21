var wbesHelper = require('../dbHelpers/wbesHelper');

var queryParams = {
    wbes_entity: ["CGPL"],
    wbes_metric : ["schedule"]
};

wbesHelper.handleWbesQuery(queryParams, function (err, res) {
    if (err) {
        console.log(err);
    }
    console.log(res);
});