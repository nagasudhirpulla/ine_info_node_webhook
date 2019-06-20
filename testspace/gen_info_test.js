const genInfo = require('../dbHelpers/generatorInfoHelper');
genInfo.initGenInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);
    // console.log(geoInfo.getGeoInfoGlobalVar()['GADARWARA']);
    queryParams = { gen_entity: ['GADARWARA'], gen_param: ['installed_capacity'] };
    genInfo.handleQuery(queryParams, function (err, data) {
        console.log(data);
    });
});