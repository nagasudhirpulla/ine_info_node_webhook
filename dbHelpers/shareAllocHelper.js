// not needed, absolete
const ShareAllocInfo = require("./share_alloc_info");

module.exports.handleQuery = function (queryParams, callback) {
    var speechText = '';
    var share_alloc_info_string = '';
    var wbes_entity = queryParams && queryParams.wbes_entity && queryParams.wbes_entity[0] ? queryParams.wbes_entity[0] : null;
    var const_entity = queryParams && queryParams.constituent_entity && queryParams.constituent_entity[0] ? queryParams.constituent_entity[0] : null;

    // derive the peak share allocation info for the combination
    const peak_alloc_rows = ShareAllocInfo.share_alloc['shares_peak'];
    let peak_info_row = null;
    for (let peakInfoIter = 0; peakInfoIter < peak_alloc_rows.length; peakInfoIter++) {
        // check if this row matches
        let tempRow = peak_alloc_rows[peakInfoIter];
        if (tempRow[0] == wbes_entity && tempRow[1] == const_entity) {
            peak_info_row = tempRow;
        }
    }

    // derive the off peak share allocation info for the combination
    const off_peak_alloc_rows = ShareAllocInfo.share_alloc['shares_off_peak'];
    let off_peak_info_row = null;
    for (let offPeakInfoIter = 0; offPeakInfoIter < off_peak_alloc_rows.length; offPeakInfoIter++) {
        // check if this row matches
        let tempRow = off_peak_alloc_rows[offPeakInfoIter];
        if (tempRow[0] == wbes_entity && tempRow[1] == const_entity) {
            off_peak_info_row = tempRow;
        }
    }


    if (off_peak_info_row == null && peak_info_row == null) {
        share_alloc_info_string = 'Sorry, we do not have the Share allocation info of ' + const_entity + ' in ' + wbes_entity;
    } else {
        if (peak_info_row != null) {
            share_alloc_info_string += 'Peak Share allocation of ' + const_entity + ' in ' + wbes_entity + ' is ' + peak_info_row[2] + '%';
        }
        if (off_peak_info_row != null) {
            if (share_alloc_info_string == '') {
                share_alloc_info_string = 'Off-Peak Share allocation of ' + const_entity + ' in ' + wbes_entity + ' is ' + off_peak_info_row[2] + '%';
            } else {
                share_alloc_info_string += ' and Off-Peak Share allocation of is ' + off_peak_info_row[2] + '%';
            }
        }
    }

    // prepare speech text and send
    speechText = share_alloc_info_string + ", please ask for another information";
    return callback(null, { 'speechText': speechText });
};