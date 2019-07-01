const readXlsxFile = require('read-excel-file/node');
const groupObjBy = require('../utils/objUtils').groupObjBy;
const appState = require('../appState');

var registerShareAllocInfoAppState = module.exports.registerShareAllocInfoAppState = function (obj) {
    appState.registerAppState("share_alloc_info", obj);
}

var getShareAllocInfoAppState = module.exports.getShareAllocInfoAppState = function () {
    return appState.getAppState("share_alloc_info");
}

module.exports.initShareAllocInfoAppState = function (callback) {
    const schema = {
        'share_type': {
            prop: 'share_type',
            type: String,
            required: true
        },
        'gen_name': {
            prop: 'gen_name',
            type: String,
            required: true
        },
        'constituent_name': {
            prop: 'constituent_name',
            type: String,
            required: true
        },
        'share': {
            prop: 'share',
            type: Number,
            required: true
        }
    }

    const path = require('path');
    const excelPath = path.join(__dirname, '..', 'dbHelpers', 'share_alloc_info.xlsx');
    readXlsxFile(excelPath, { schema }).then(({ rows, errors }) => {
        // `errors` have shape `{ row, column, error, value }`
        if (errors.length != 0) {
            // console.log(errors);
            return callback(errors);
        }
        let share_alloc_info = groupObjBy(rows, 'share_type');
        // console.log(share_alloc_info);
        registerShareAllocInfoAppState(share_alloc_info);
        callback(null, getShareAllocInfoAppState());
    })
}

module.exports.handleQuery = function (queryParams, callback) {
    var speechText = '';
    var share_alloc_info_string = '';
    var wbes_entity = queryParams && queryParams.wbes_entity && queryParams.wbes_entity[0] ? queryParams.wbes_entity[0] : null;
    var const_entity = queryParams && queryParams.constituent_entity && queryParams.constituent_entity[0] ? queryParams.constituent_entity[0] : null;

    // derive the peak share allocation info for the combination
    const peak_alloc_rows = getShareAllocInfoAppState()['shares_peak'];
    let peak_info_row = null;
    for (let peakInfoIter = 0; peakInfoIter < peak_alloc_rows.length; peakInfoIter++) {
        // check if this row matches
        let tempRow = peak_alloc_rows[peakInfoIter];
        if (tempRow["gen_name"] == wbes_entity && tempRow["constituent_name"] == const_entity) {
            peak_info_row = tempRow;
        }
    }

    // derive the off peak share allocation info for the combination
    const off_peak_alloc_rows = getShareAllocInfoAppState()['shares_off_peak'];
    let off_peak_info_row = null;
    for (let offPeakInfoIter = 0; offPeakInfoIter < off_peak_alloc_rows.length; offPeakInfoIter++) {
        // check if this row matches
        let tempRow = off_peak_alloc_rows[offPeakInfoIter];
        if (tempRow["gen_name"] == wbes_entity && tempRow["constituent_name"] == const_entity) {
            off_peak_info_row = tempRow;
        }
    }


    if (off_peak_info_row == null && peak_info_row == null) {
        share_alloc_info_string = `Sorry, we do not have the Share allocation info of ${const_entity} in ${wbes_entity}`;
    } else {
        if (peak_info_row != null) {
            share_alloc_info_string += `Peak Share allocation of ${const_entity} in ${wbes_entity} is ${peak_info_row["share"]}%`;
        }
        if (off_peak_info_row != null) {
            const off_peak_share = off_peak_info_row["share"]
            if (share_alloc_info_string == '') {
                share_alloc_info_string = `Off-Peak Share allocation of ${const_entity} in ${wbes_entity} is ${off_peak_share}%`;
            } else {
                share_alloc_info_string += ` and Off-Peak Share allocation is ${off_peak_share}%`;
            }
        }
    }

    // prepare speech text and send
    speechText = `${share_alloc_info_string}, please ask for another information`;
    return callback(null, { 'speechText': speechText });
};