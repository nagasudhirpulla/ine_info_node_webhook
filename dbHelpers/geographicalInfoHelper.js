const readXlsxFile = require('read-excel-file/node');
const groupObjBy = require('../utils/objUtils').groupObjBy;

// var path = require('path');
// var excelPath = path.join(__dirname, '..', 'dbHelpers', 'geographical_info.xlsx');
var geo_info_state = {

};

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
            type: Number,
            required: true
        },
        'longitude': {
            prop: 'longitude',
            type: Number,
            required: true
        },
        'state': {
            prop: 'state',
            type: String,
            required: true
        }
    }

    readXlsxFile('geographical_info.xlsx', { schema }).then(({ rows, errors }) => {
        // `errors` have shape `{ row, column, error, value }`
        if (errors.length != 0) {
            // console.log(errors);
            return callback(errors);
        }
        // console.log(groupObjBy(rows, 'name'));
        geo_info_state = groupObjBy(rows, 'name')
        callback(null, geo_info_state);
    })
}

module.exports.getGeoInfoGlobalVar = function () {
    return geo_info_state;
}

module.exports.handleQuery = function (queryParams, callback) {
    var speechText = '';
    var geo_info_string = '';
    var geo_entity = queryParams && queryParams.geo_entity && queryParams.geo_entity[0] ? queryParams.geo_entity[0] : null;

    // derive the peak share allocation info for the combination
    let geo_info_row = geo_info_state[geo_entity];
    if (geo_info_row == undefined || geo_info_row == null) {
        geo_info_string = 'Sorry, we do not have the geographical info of ' + geo_entity;
    } else {
        if (geo_info_row != null) {
            geo_info_string += geo_info_row['info'];
        }
    }

    // prepare speech text and send
    speechText = geo_info_string + ", please ask for another information";
    return callback(null, { 'speechText': speechText });
};