var ScheduleModel = require('../models/schedule');

const utilId = 'c881325e-0c77-4961-a128-f4f067a86077', date_str = '12-10-2018', rev = 39, isSeller = true;
ScheduleModel.getIsgsMarginsObj(utilId, date_str, rev, function (err, marginsObj) {
    console.log(marginsObj['margins'].join(','));
});
