const ssInfo = require('../dbHelpers/substationInfoHelper');
ssInfo.initSubstationsInfoAppState(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);
    // console.log(geoInfo.getGeoInfoGlobalVar()['GADARWARA']);
    queryParams = { substation: ['Gadarwara']};
    ssInfo.handleNumLinesQuery(queryParams, function (err, data) {
        console.log(data);
    });
});