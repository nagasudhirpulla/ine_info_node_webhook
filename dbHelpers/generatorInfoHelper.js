const readXlsxFile = require('read-excel-file/node');
const groupObjBy = require('../utils/objUtils').groupObjBy;
const appState = require('../appState');

var registerGenInfoAppState = module.exports.registerGenInfoAppState = function (obj) {
    appState.registerAppState("gen_info", obj);
}

var getGenInfoAppState = module.exports.getGenInfoAppState = function () {
    return appState.getAppState("gen_info");
}

module.exports.initGenInfoGlobalVar = function (callback) {
    const schema = {
        'name': {
            prop: 'name',
            type: String,
            required: true
        },
        'installed_capacity': {
            prop: 'installed_capacity',
            type: String,
            required: true
        },
        'ultimate_capacity': {
            prop: 'ultimate_capacity',
            type: String,
            required: true
        },
        'fixed_cost': {
            prop: 'fixed_cost',
            type: String,
            required: true
        },
        'var_cost': {
            prop: 'var_cost',
            type: String,
            required: true
        }
    }
    const path = require('path');
    const excelPath = path.join(__dirname, '..', 'dbHelpers', 'generator_info.xlsx');
    readXlsxFile(excelPath, { schema }).then(({ rows, errors }) => {
        // `errors` have shape `{ row, column, error, value }`
        if (errors.length != 0) {
            // console.log(errors);
            return callback(errors);
        }
        // console.log(groupObjBy(rows, 'name'));
        registerGenInfoAppState(groupObjBy(rows, 'name'));
        callback(null, getGenInfoAppState());
    })
}

var getGenInfoOfEntity = module.exports.getGenInfoOfEntity = function (gen_entity) {
    const entStr = gen_entity + "";
    let entityGenInfo = getGenInfoAppState()[entStr];
    if (typeof entityGenInfo == 'object' && typeof entityGenInfo.length == 'number' && entityGenInfo.length >= 0) {
        entityGenInfo = entityGenInfo[0];
    }
    if (entityGenInfo != null && entityGenInfo != undefined) {
        return entityGenInfo;
    }
    return null;
}

module.exports.handleQuery = function (queryParams, callback) {
    var speechText = '';
    var gen_info_string = '';
    var gen_entity = queryParams && queryParams.generator_entity && queryParams.generator_entity[0] ? queryParams.generator_entity[0] : null;
    var gen_param = queryParams && queryParams.generator_parameter && queryParams.generator_parameter[0] ? queryParams.generator_parameter[0] : null;

    // derive the peak share allocation info for the combination
    let gen_info_row = getGenInfoOfEntity(gen_entity);
    if (gen_info_row == undefined || gen_info_row == null) {
        gen_info_string = 'Sorry, we do not have the info of the generator ' + gen_entity;
    } else {
        // installed_capacity	ultimate_capacity	fixed_cost	var_cost
        if (gen_param == "installed_capacity") {
            gen_info_string += `Installed capacity of ${gen_entity} is ${gen_info_row['installed_capacity']} MW`;
        } else if (gen_param == "ultimate_capacity") {
            gen_info_string += `Ultimate capacity of ${gen_entity} is ${gen_info_row['ultimate_capacity']} MW`;
        } else if (gen_param == "fixed_cost") {
            gen_info_string += `Fixed cost of ${gen_entity} is ${gen_info_row['fixed_cost']} paise`;
        } else if (gen_param == "var_cost") {
            gen_info_string += `Variable cost of ${gen_entity} is ${gen_info_row['var_cost']} paise`;
        } else {
            gen_info_string += `Sorry, we donot have the ${gen_param} info of ${gen_entity}`;
        }
    }

    // prepare speech text and send
    speechText = gen_info_string + ", please ask for another information";
    return callback(null, { 'speechText': speechText });
};