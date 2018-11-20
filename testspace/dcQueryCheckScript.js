var wbesHelper = require('../dbHelpers/wbesHelper');

var queryParams = {
    wbes_entity: ["WR"],
    wbes_metric : ["urs"]
};

wbesHelper.handleWbesQuery(queryParams, function (err, res) {
    if (err) {
        console.log(err);
    }
    console.log(res);
});