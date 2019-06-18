const geoInfo = require('../dbHelpers/geographicalInfoHelper');
geoInfo.initGeoInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);
    console.log(geoInfo.getGeoInfoGlobalVar()['GADARWARA']);
});