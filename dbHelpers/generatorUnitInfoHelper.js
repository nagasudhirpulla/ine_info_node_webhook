const readXlsxFile = require('read-excel-file/node');
const groupObjBy = require('../utils/objUtils').groupObjBy;
const convertDateObjToSpeechDate = require('../utils/dateUtils').convertDateObjToSpeechDate;
const appState = require('../appState');

var registerGenUnitInfoAppState = module.exports.registerGenUnitInfoAppState = function (obj) {
    appState.registerAppState("gen_unit_info", obj);
}

var getGenUnitInfoAppState = module.exports.getGenUnitInfoAppState = function () {
    return appState.getAppState("gen_unit_info");
}

module.exports.initGenUnitInfoGlobalVar = function (callback) {
    const schema = {
        'name': {
            prop: 'name',
            type: String,
            required: true
        },
        'unit': {
            prop: 'unit',
            type: String,
            required: true
        },
        'ramp': {
            prop: 'ramp',
            type: String,
            required: false
        },
        'trial_run_date': {
            prop: 'trial_run_date',
            type: Date,
            required: false
        },
        'cod_date': {
            prop: 'cod_date',
            type: Date,
            required: false
        }
    }
    const path = require('path');
    const excelPath = path.join(__dirname, '..', 'dbHelpers', 'generator_unit_info.xlsx');
    readXlsxFile(excelPath, { schema }).then(({ rows, errors }) => {
        // `errors` have shape `{ row, column, error, value }`
        if (errors.length != 0) {
            // console.log(errors);
            return callback(errors);
        }
        // group rows by generator names
        let gen_grp_info = groupObjBy(rows, 'name');
        const genNames = Object.keys(gen_grp_info);
        // group already grouped generators by unit
        for (let genIter = 0; genIter < genNames.length; genIter++) {
            let genName = genNames[genIter];
            gen_grp_info[genName] = groupObjBy(gen_grp_info[genName], 'unit')
        }
        // console.log(gen_grp_info);
        registerGenUnitInfoAppState(gen_grp_info);
        callback(null, getGenUnitInfoAppState());
    })
}

var getGenUnitsInfoOfEntity = module.exports.getGenUnitsInfoOfEntity = function (gen_entity) {
    const entStr = gen_entity + "";
    let entityGenInfo = getGenUnitInfoAppState()[entStr];
    if (entityGenInfo != undefined && entityGenInfo != null && typeof entityGenInfo == 'object') {
        return entityGenInfo;
    }
    return null;
}

module.exports.handleQuery = function (queryParams, callback) {
    var speechText = '';
    var gen_info_string = '';
    var gen_entity = queryParams && queryParams.generator_entity && queryParams.generator_entity[0] ? queryParams.generator_entity[0] : null;
    var gen_param = queryParams && queryParams.generator_parameter && queryParams.generator_parameter[0] ? queryParams.generator_parameter[0] : null;
    var gen_unit_name = queryParams && queryParams.generator_unit_name && queryParams.generator_unit_name[0] ? queryParams.generator_unit_name[0] : null;

    // derive the peak share allocation info for the combination
    let gen_units_info_obj = getGenUnitsInfoOfEntity(gen_entity);
    if (gen_units_info_obj == undefined || gen_units_info_obj == null) {
        gen_info_string = 'Sorry, we do not have the info of the generator ' + gen_entity;
    } else {
        let speechUnits = [];
        if (gen_unit_name == null || gen_unit_name == undefined) {
            // consider all the units for speech
            speechUnits = Object.keys(gen_units_info_obj);
        } else {
            // unit name is mentioned in query, hence check if unit is present
            const genUnits = Object.keys(gen_units_info_obj);
            genUnits.every(function (genUnitName, genNameIter) {
                // Do your thing, then:
                if (genUnitName + '' == gen_unit_name + '') {
                    speechUnits.push(genUnitName);
                    return false;
                }
                else return true;
            })
        }

        const param_to_dict_mapping = { "ramp": "ramp", "trial_run_date": "trial_run_date", "cod_date": "cod_date" }
        const param_to_speech_key_mapping = { "ramp": "Ramp rate", "trial_run_date": "Trial run date", "cod_date": "C.O.D date" }
        //synthesize speech based on the units selected
        if (speechUnits.length > 0 && gen_param != null) {
            const isParamInGenDict = Object.keys(param_to_dict_mapping).includes(gen_param)
            if (isParamInGenDict) {
                const dictParam = param_to_dict_mapping[gen_param];
                let numUnitsHit = 0;
                gen_info_string += `${param_to_speech_key_mapping[gen_param]} of ${gen_entity} `;
                for (let speechUnitIter = 0; speechUnitIter < speechUnits.length; speechUnitIter++) {
                    const speechUnit = speechUnits[speechUnitIter];
                    let genUnitinfo = gen_units_info_obj[speechUnit][0][dictParam];
                    if (genUnitinfo != undefined) {
                        if (['trial_run_date', 'cod_date'].includes(dictParam)) {
                            genUnitinfo = convertDateObjToSpeechDate(genUnitinfo);
                        }
                        gen_info_string += `unit ${speechUnit} is ${genUnitinfo}${(speechUnitIter != speechUnits.length - 1) ? ', ' : ''}`;
                        numUnitsHit = numUnitsHit + 1;
                    }
                }
                if (numUnitsHit == 0) {
                    gen_info_string = `Sorry, we donot have the ${gen_param} info of ${gen_entity}`;
                }
            } else {
                gen_info_string = `Sorry, we donot have the ${gen_param} info of ${gen_entity}`;
            }
        } else {
            gen_info_string += `Sorry, we donot have the ${gen_param} info of ${gen_entity} ${((gen_unit_name != null) ? "unit " + gen_unit_name : "")}`;
        }
    }

    // prepare speech text and send
    speechText = gen_info_string + ", please ask for another information";
    return callback(null, { 'speechText': speechText });
};