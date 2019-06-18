const readXlsxFile = require('read-excel-file/node');
const groupObjBy = require('../utils/objUtils').groupObjBy;

// var path = require('path');
// var excelPath = path.join(__dirname, '..', 'dbHelpers', 'geographical_info.xlsx');

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
        global.geo_info = groupObjBy(rows, 'name');
        callback(null, global.geo_info);
    })
}

module.exports.getGeoInfoGlobalVar = function () {
    return global.geo_info;
}