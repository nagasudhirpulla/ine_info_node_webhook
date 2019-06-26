const genUnitInfo = require('../dbHelpers/generatorUnitInfoHelper');
genUnitInfo.initGenUnitInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    console.log(JSON.stringify(data));
    // console.log(geoInfo.getGeoInfoGlobalVar()['GADARWARA']);
    queryParams = { generator_entity: ['Solapur'], generator_parameter: ['ramp'] };
    genUnitInfo.handleQuery(queryParams, function (err, data) {
        console.log(data);
    });
});