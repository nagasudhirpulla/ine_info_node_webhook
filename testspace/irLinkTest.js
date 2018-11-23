// var schModel = require('../models/schedule');
// schModel.getAtcSch('west','north', 'atc_margin', '21-11-2018', 40, function (err, resObj) {
//     if (err) {
//         return console.log(err);
//     }
//     console.log(resObj);
// });

var irLinkHelper = require('../dbHelpers/irLinkHelper');

var queryParams = {
    from_region: ["north"],
    to_region: ["west"],
    ir_schedule_metric : ["atc_margin"]
};

irLinkHelper.handleWbesQuery(queryParams, function (err, res) {
    if (err) {
        console.log(err);
    }
    console.log(res);
});