const genUnitInfo = require('../dbHelpers/generatorUnitInfoHelper');
genUnitInfo.initGenUnitInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(JSON.stringify(data));
    queryParams = { generator_entity: ['SKS'], generator_parameter: ['cod_date'] };
    genUnitInfo.handleQuery(queryParams, function (err, data) {
        console.log(data);
    });
});