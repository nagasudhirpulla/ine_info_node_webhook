const CODInfo = require("./cod_info");

module.exports.handleQuery = function (queryParams, callback) {
    var speechText = '';
    var cod_info_string = '';
    var cod_entity = queryParams && queryParams.cod_entity && queryParams.cod_entity[0] ? queryParams.cod_entity[0] : null;

    // derive the cod date for the entity
    const cod_obj = CODInfo.cod_dates[cod_entity];
    if (typeof cod_obj == 'undefined') {
        cod_info_string = 'Sorry, we do not have the C.O.D info of ' + cod_entity;
    } else if (typeof cod_obj == 'string') {
        cod_info_string = 'C.O.D date of ' + cod_entity + ' is ' + cod_obj;
    } else if (typeof cod_obj == 'object') {
        // get all the unit names through keys of the object
        var unit_names = Object.keys(cod_obj);
        // iterate through all the units for dates
        if (unit_names.length > 0) {
            cod_info_string += 'C.O.D date of ';
        }
        for (let unitIter = 0; unitIter < unit_names.length; unitIter++) {
            const unit = unit_names[unitIter];
            cod_info_string += unit + ' is ' + cod_obj[unit];
            if (unitIter != unit_names.length - 1) {
                //do not append comma for last unit
                cod_info_string += ", "
            }
        }
    }

    // prepare speech text and send
    if (cod_entity != null) {
        // derived the cod entity
        // get the cod text for the entity
        speechText = cod_info_string + ", please ask for another information";
        return callback(null, { 'speechText': speechText });
    } else {
        speechText = 'Sorry, we could not figure out the C.O.D entity from your query, please try again...';
        return callback(null, { 'speechText': speechText });
    }
};