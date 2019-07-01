const readXlsxFile = require('read-excel-file/node');
const groupObjBy = require('../utils/objUtils').groupObjBy;
const appState = require('../appState');

var registerSubstationsInfoAppState = module.exports.registerSubstationsInfoAppState = function (obj) {
    appState.registerAppState("substations_info", obj);
}

var getSubstationsInfoAppState = module.exports.getSubstationsInfoAppState = function () {
    return appState.getAppState("substations_info");
}

module.exports.initSubstationsInfoAppState = function (callback) {
    const schema = {
        'name': {
            prop: 'name',
            type: String,
            required: true
        },
        'num_lines': {
            prop: 'num_lines',
            type: Number,
            required: true
        }
    }

    const path = require('path');
    const excelPath = path.join(__dirname, '..', 'dbHelpers', 'substations_info.xlsx');
    readXlsxFile(excelPath, { schema }).then(({ rows, errors }) => {
        // `errors` have shape `{ row, column, error, value }`
        if (errors.length != 0) {
            // console.log(errors);
            return callback(errors);
        }
        let ss_info = groupObjBy(rows, 'name');
        // console.log(share_alloc_info);
        registerSubstationsInfoAppState(ss_info);
        callback(null, getSubstationsInfoAppState());
    })
}

var getSubstationInfoOfEntity = module.exports.getSubstationInfoOfEntity = function (ss_entity) {
    const entStr = ss_entity + "";
    let ssInfo = getSubstationsInfoAppState()[entStr];
    if (typeof ssInfo == 'object' && typeof ssInfo.length == 'number' && ssInfo.length >= 0) {
        ssInfo = ssInfo[0];
    }
    if (ssInfo != null && ssInfo != undefined) {
        return ssInfo;
    }
    return null;
}

module.exports.handleNumLinesQuery = function (queryParams, callback) {
    var speechText = '';
    var ss_info_string = '';
    let substation = queryParams && queryParams.substation && queryParams.substation[0] ? queryParams.substation[0] : null;
    let ss_param = "num_lines"
    
    if (substation == null || ss_param == null) {
        ss_info_string = `Sorry, we are unable to extract the substation parameters`;
    } else {
        // derive the peak share allocation info for the combination
        let ss_info_row = getSubstationInfoOfEntity(substation);
        if (ss_info_row == undefined || ss_info_row == null) {
            ss_info_string = 'Sorry, we do not have the substation info of ' + substation;
        } else {
            const param_to_dict_mapping = { "num_lines": "num_lines" }
            const param_to_speech_key_mapping = { "num_lines": "Number of emanating lines" }
            //synthesize speech based
            const isParamInGenDict = Object.keys(param_to_dict_mapping).includes(ss_param)
            if (isParamInGenDict) {
                const dictParam = param_to_dict_mapping[ss_param];
                ss_info_string += `${param_to_speech_key_mapping[ss_param]} of ${substation} is ${ss_info_row[dictParam]}`;
            } else {
                ss_info_string += `Sorry, we donot have the ${ss_param} info of ${substation}`;
            }
        }
    }
    // prepare speech text and send
    speechText = ss_info_string + ", please ask for another information";
    return callback(null, { 'speechText': speechText });
};