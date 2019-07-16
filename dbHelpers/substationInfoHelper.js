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
        },
        '132KV': {
            prop: '132KV',
            type: Number,
            required: true
        },
        '220KV': {
            prop: '220KV',
            type: Number,
            required: true
        },
        '33KV': {
            prop: '33KV',
            type: Number,
            required: true
        },
        '400KV': {
            prop: '400KV',
            type: Number,
            required: true
        },
        '765KV': {
            prop: '765KV',
            type: Number,
            required: true
        }
    };

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
    let substation = queryParams && queryParams.pwc_substation && queryParams.pwc_substation[0] ? queryParams.pwc_substation[0] : null;
    let ss_param = "num_lines"

    if (substation == null || ss_param == null) {
        ss_info_string = `Sorry, we are unable to extract the substation parameters`;
    } else {
        // derive the peak share allocation info for the combination
        let ss_info_row = getSubstationInfoOfEntity(substation);
        if (ss_info_row == undefined || ss_info_row == null) {
            ss_info_string = 'Sorry, we do not have the substation info of ' + substation;
        } else {
            const voltLevelKeys = ['765KV', '400KV', '220KV', '132KV', '33KV'];
            const param_to_dict_key_mapping = { "num_lines": "num_lines" };
            const param_to_speech_word_mapping = { "num_lines": "Number of emanating lines", '132KV': '132 KV', '220KV': '220 KV', '33KV': '33 KV', '400KV': '400 KV', '765KV': '765 KV' };
            //synthesize speech based
            const isParamInGenDict = Object.keys(param_to_dict_key_mapping).includes(ss_param);
            if (isParamInGenDict) {
                const dictParam = param_to_dict_key_mapping[ss_param];
                ss_info_string += `${param_to_speech_word_mapping[ss_param]} of ${substation} is ${ss_info_row[dictParam]}`;
                let voltInfoStrings = [];
                for (let voltIter = 0; voltIter < voltLevelKeys.length; voltIter++) {
                    const voltLevelKey = voltLevelKeys[voltIter];
                    let voltNumLines = ss_info_row[voltLevelKey];
                    if (voltNumLines != 0) {
                        voltInfoStrings.push(`${voltNumLines} ${param_to_speech_word_mapping[voltLevelKey]} ${voltNumLines == 1 ? 'line' : 'lines'}`);
                    }
                }
                if (voltInfoStrings.length > 0) {
                    ss_info_string += ` with ${voltInfoStrings.join(', ')}`;
                }
            } else {
                ss_info_string += `Sorry, we donot have the ${ss_param} info of ${substation}`;
            }
        }
    }
    // prepare speech text and send
    speechText = ss_info_string + ", please ask for another information";
    return callback(null, { 'speechText': speechText });
};