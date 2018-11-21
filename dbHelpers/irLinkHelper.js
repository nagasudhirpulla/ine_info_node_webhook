const Schedule = require("../models/schedule");
const StrUtils = require("../utils/stringUtils");
var ArrayHelper = require('../utils/arrayHelpers');
var async = require('async');
const Revision = require("../models/revision");
const maxStatStr = 'maximum';
const minStatStr = 'minimum';
const avgStatStr = 'average';

module.exports.handleWbesQuery = function (queryParams, callback) {
    var speechText = '';
    var from_region = queryParams && queryParams.from_region && queryParams.from_region[0] ? queryParams.from_region[0] : null;
    var to_region = queryParams && queryParams.to_region && queryParams.to_region[0] ? queryParams.to_region[0] : null;
    var wbesMetric = queryParams && queryParams.wbes_metric && queryParams.wbes_metric[0] ? queryParams.wbes_metric[0] : null;
    var blockNum = queryParams && queryParams.block && queryParams.block[0] ? queryParams.block[0] : null;
    var revNum = queryParams && queryParams.revision_number && queryParams.revision_number[0] ? queryParams.revision_number[0] : null;
    var statistic = queryParams && queryParams.statistic && queryParams.statistic[0] ? queryParams.statistic[0] : null;
    var dateStr = queryParams && queryParams.date && queryParams.date[0] ? queryParams.date[0] : null;

    if (from_region != null && to_region != null) {
        if (wbesMetric != null) {
            // we have entity and metric

            // Resolve the date
            var reqDate = new Date();
            if (dateStr != null) {
                reqDate = new Date(dateStr);
            }
            var paramDateStr = StrUtils.makeTwoDigits(reqDate.getDate()) + "-" + StrUtils.makeTwoDigits(reqDate.getMonth() + 1) + "-" + reqDate.getFullYear();
            // Resolve the revision number  
            var rev = null;
            var getDayRevisions = function (callback) {
                // get all the revisions of the day
                Revision.getRevisionsForDate(paramDateStr, function (err, revList) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, { 'revisions': revList });
                });
            };
            var resolveRev = function (resObj, callback) {
                // resolve the revision to fetch
                var resolvedRev = null;
                var maxRev = Math.max(...resObj['revisions']);
                if (revNum != null && !isNaN(revNum) && revNum < maxRev) {
                    resolvedRev = revNum;
                } else {
                    // take max rev if rev number not supplied
                    resolvedRev = maxRev;
                }
                return callback(null, { 'revision': resolvedRev });
            };
            var getIrLinkData = function (resObj, callback) {
                var resolvedRev = resObj['revision'];
                // get required wbes data using the date, rev, metric
                if (['net', 'total', 'atc_margin'].indexOf(wbesMetric) > 0) {
                    Schedule.getAtcSch(from_region, to_region, wbesMetric, paramDateStr, resolvedRev, function (err, atcSchObj) {
                        if (err) {
                            return callback(err);
                        }
                        var schVals = atcSchObj["schedules"];
                        var speechText = getStatisticSpeechFromBlockVals(schVals, from_region+' to '+to_region, wbesMetric, statistic, blockNum);
                        return callback(null, { 'speechText': speechText });
                    });
                } else {
                    return callback(null, { 'speechText': 'Sorry, we could not figure out the wbes metric, please try again...' });
                }
            };
            var tasksArray = [getDayRevisions, resolveRev, getIrLinkData];
            async.waterfall(tasksArray, function (err, resObj) {
                if (err) {
                    return callback(err);
                }
                //synthesise the speech text
                return callback(null, { 'speechText': resObj['speechText'] });
            });
        } else {
            speechText = `Sorry, we could not figure out the wbes metric of ${from_region} to ${to_region}, please try again...`;
            return callback(null, { 'speechText': speechText });
        }
    } else {
        speechText = 'Sorry, we could not figure out the inter regional link from your query, please try again...';
        return callback(null, { 'speechText': speechText });
    }
};

function getStatisticSpeechFromBlockVals(blkVals, wbesEntity, wbesMetric, statistic, blockNum) {
    if (statistic == maxStatStr) {
        var maxVal = Math.max(...blkVals);
        var maxBlk = blkVals.indexOf(maxVal) + 1;
        var speechText = `${wbesEntity} ${wbesMetric} max value is ${(+maxVal).toFixed(0)} at ${(+maxBlk)} time block. Please ask for another information...`;
    }
    else if (statistic == minStatStr) {
        var minVal = Math.min(...blkVals);
        var minBlk = blkVals.indexOf(minVal) + 1;
        speechText = `${wbesEntity} ${wbesMetric} minimum value is ${(+minVal).toFixed(0)} at ${(+minBlk)} time block. Please ask for another information...`;
    }
    else if (statistic == avgStatStr) {
        var avgVal = ArrayHelper.getAvgVal(blkVals);
        speechText = `${wbesEntity} ${wbesMetric} average value is ${(+avgVal).toFixed(0)}. Please ask for another information...`;
    }
    else if (blockNum != null) {
        if (blockNum > 0 && blockNum < 97) {
            speechText = `${wbesEntity} ${wbesMetric} value at block ${blockNum} is ${(+blkVals[blockNum - 1]).toFixed(0)}. Please ask for another information...`;
        } else {
            speechText = `The block number should be in between 1 and 96. Please ask for another information...`;
        }
    }
    else if (blockNum == null && statistic == null) {
        // give all stat information
        maxVal = Math.max(...blkVals);
        minVal = Math.min(...blkVals);
        avgVal = ArrayHelper.getAvgVal(blkVals);
        maxBlk = blkVals.indexOf(maxVal) + 1;
        minBlk = blkVals.indexOf(minVal) + 1;
        speechText = `${wbesEntity} ${wbesMetric} average value is ${(+avgVal).toFixed(0)}, max value is ${(+maxVal).toFixed(0)} at ${(+maxBlk)} time block, minimum value is ${(+minVal).toFixed(0)} at ${(+minBlk)} time block. Please ask for another information...`;
    }
    return speechText;
}