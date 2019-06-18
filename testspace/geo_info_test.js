const geoInfo = require('../dbHelpers/geographicalInfoHelper');
geoInfo.initGeoInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);
    // console.log(geoInfo.getGeoInfoGlobalVar()['GADARWARA']);
    queryParams = { geo_entity: ['GADARWARA'] };
    geoInfo.handleQuery(queryParams, function (err, data) {
        console.log(data);
    });
});