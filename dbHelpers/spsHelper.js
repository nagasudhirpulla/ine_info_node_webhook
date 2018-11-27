const SPSInfo = require("./sps_info");

module.exports.handleWbesQuery = function (queryParams, callback) {
    var speechText = '';
    var sps_entity = queryParams && queryParams.sps_entity && queryParams.sps_entity[0] ? queryParams.sps_entity[0] : null;
    // get the sps condition for the entity
    const sps_string = SPSInfo.info[sps_entity];
    if (sps_entity != null) {
        // derived the sps entity
        // get the sps text for the entity
        speechText = sps_string + ", please ask for another information";
        return callback(null, { 'speechText': speechText });
    } else {
        speechText = 'Sorry, we could not figure out the S.P.S information from your query, please try again...';
        return callback(null, { 'speechText': speechText });
    }
};