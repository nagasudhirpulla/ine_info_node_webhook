var getUtilISGSReq = require('../utils/wrReqUtils').getUtilISGSReq;

getUtilISGSReq("5df201ba-1574-475a-ad25-b26533170943", "29-11-2018", 10, true, function (err, reqVals) {
    if (err) {
        return console.log(err);
    }
    console.log(reqVals);
});
