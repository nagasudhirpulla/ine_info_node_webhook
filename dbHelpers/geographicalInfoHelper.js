const readXlsxFile = require('read-excel-file/node');
const groupObjBy = require('../utils/objUtils').groupObjBy;
const appState = require('../appState');

var registerGeoInfoAppState = module.exports.registerGeoInfoAppState = function (obj) {
    appState.registerAppState("geo_info", obj);
}

var getGeoInfoAppState = module.exports.getGeoInfoAppState = function () {
    return appState.getAppState("geo_info");
}

module.exports.initGeoInfoGlobalVar = function (callback) {
    const schema = {
        'name': {
            prop: 'name',
            type: String,
            required: true
        },
        'info': {
            prop: 'info',
            type: String,
            required: true
        },
        'latitude': {
            prop: 'latitude',
            type: String,
            required: true
        },
        'longitude': {
            prop: 'longitude',
            type: String,
            required: true
        },
        'state': {
            prop: 'state',
            type: String,
            required: true
        }
    }

    const path = require('path');
    const excelPath = path.join(__dirname, '..', 'dbHelpers', 'geographical_info.xlsx');
    readXlsxFile(excelPath, { schema }).then(({ rows, errors }) => {
        // `errors` have shape `{ row, column, error, value }`
        if (errors.length != 0) {
            // console.log(errors);
            return callback(errors);
        }
        // console.log(groupObjBy(rows, 'name'));
        registerGeoInfoAppState(groupObjBy(rows, 'name'));
        callback(null, getGeoInfoAppState());
    })
}

var getGeoInfoOfEntity = module.exports.getGeoInfoOfEntity = function (geo_entity) {
    const entStr = geo_entity + "";
    let entityGeoInfo = getGeoInfoAppState()[entStr];
    if (typeof entityGeoInfo == 'object' && typeof entityGeoInfo.length == 'number' && entityGeoInfo.length >= 0) {
        entityGeoInfo = entityGeoInfo[0];
    }
    if (entityGeoInfo != null && entityGeoInfo != undefined) {
        return entityGeoInfo;
    }
    return null;
}

module.exports.handleQuery = function (queryParams, callback) {
    var speechText = '';
    var geo_info_string = '';
    var geo_entity = queryParams && queryParams.geo_entity && queryParams.geo_entity[0] ? queryParams.geo_entity[0] : null;

    // derive the peak share allocation info for the combination
    let geo_info_row = getGeoInfoOfEntity(geo_entity);
    if (geo_info_row == undefined || geo_info_row == null) {
        geo_info_string = 'Sorry, we do not have the geographical info of ' + geo_entity;
    } else {
        geo_info_string += geo_info_row['info'];
    }

    // prepare speech text and send
    speechText = geo_info_string + ", please ask for another information";
    return callback(null, { 'speechText': speechText });
};