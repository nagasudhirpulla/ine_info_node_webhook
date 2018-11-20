const UtilIds = require("./utilInfo");
const Revision = require("../models/revision");
const Schedule = require("../models/schedule");
const StrUtils = require("../utils/stringUtils");
const maxStatStr = 'maximum';
const minStatStr = 'minimum';
const avgStatStr = 'average';
const dcStr = 'dc';
const scheduleStr = 'schedule';
const ursStr = 'urs';
const rrasStr = 'rras';
const stoaStr = 'stoa';
const ltaStr = 'lta';
const mtoaStr = 'mtoa';
const marginStr = 'margin';
var ArrayHelper = require('../utils/arrayHelpers');
var async = require('async');

module.exports.handleWbesQuery = function (queryParams, callback) {
    var speechText = '';
    var wbesEntity = queryParams && queryParams.wbes_entity && queryParams.wbes_entity[0] ? queryParams.wbes_entity[0] : null;
    var wbesMetric = queryParams && queryParams.wbes_metric && queryParams.wbes_metric[0] ? queryParams.wbes_metric[0] : null;
    var blockNum = queryParams && queryParams.block && queryParams.block[0] ? queryParams.block[0] : null;
    var revNum = queryParams && queryParams.revision_number && queryParams.revision_number[0] ? queryParams.revision_number[0] : null;
    var statistic = queryParams && queryParams.statistic && queryParams.statistic[0] ? queryParams.statistic[0] : null;
    var dateStr = queryParams && queryParams.date && queryParams.date[0] ? queryParams.date[0] : null;

    if (wbesEntity != null) {
        if (wbesMetric != null) {
            // we have entity and metric
            // Resolve the utility 
            var utilId = UtilIds.utilIds[wbesEntity];
            if (utilId == undefined || utilId == null) {
                return callback({ 'message': 'Could not figure out the wbes utility.' });
            }
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
            var getWbesData = function (resObj, callback) {
                var resolvedRev = resObj['revision'];
                // get required wbes data using the date, rev, metric
                if (wbesMetric == dcStr) {
                    Schedule.getIsgsDcObj(paramDateStr, resolvedRev, utilId, function (err, dcMatrixObj) {
                        if (err) {
                            return callback(err);
                        }
                        if (dcMatrixObj['gen_names'].length == 0) {
                            var speechText = `Some error occured in fetching the ${wbesEntity} ${wbesMetric}. Please ask for another information...`;
                            return callback(null, { 'speechText': speechText });
                        }
                        var dcVals = [];
                        var genNames = dcMatrixObj["gen_names"];
                        var numGenIter = (utilId == "ALL")? genNames.length : 1;

                        for (var i = 0; i < dcMatrixObj["time_blocks"].length; i++) {
                            var blk = +dcMatrixObj["time_blocks"][i];
                            if (blk < 1 || blk > 96) {
                                continue;
                            }
                            // iterarate through each generator
                            for (let iter = 0; iter < numGenIter; iter++) {
                                if (iter == 0) {
                                    dcVals[i] = 0
                                }
                                //var onBarDCVal = (+dcMatrixObj[genNames[0]]['on_bar_dc'][blk - 1]).toFixed(0);
                                //var offBarDCVal = (+dcMatrixObj[genNames[0]]['off_bar_dc'][blk - 1]).toFixed(0);
                                var totDCVal = (+dcMatrixObj[genNames[iter]]['total_dc'][blk - 1]).toFixed(0);
                                dcVals[i] += totDCVal;
                            }
                        }
                        var speechText = getStatisticSpeechFromBlockVals(dcVals, wbesEntity, wbesMetric, statistic, blockNum);
                        return callback(null, { 'speechText': speechText });
                    });
                }
                else if ([scheduleStr, ursStr, rrasStr, stoaStr, ltaStr, mtoaStr].indexOf(wbesMetric) > -1) {
                    const isSeller = true;
                    Schedule.getIsgsNetSchObj(utilId, paramDateStr, resolvedRev, isSeller, function (err, netSchMatrixObj) {
                        if (err) {
                            return callback(err);
                        }
                        if (netSchMatrixObj['gen_names'].length == 0) {
                            var speechText = `Some error occured in fetching the ${wbesEntity} ${wbesMetric}. Please ask for another information...`;
                            return callback(null, { 'speechText': speechText });
                        }
                        var schVals = [];
                        var numGenIter = (utilId == "ALL")? genNames.length : 1;
                        for (let iter = 0; iter < numGenIter; iter++) {
                            for (var i = 0; i < netSchMatrixObj["time_blocks"].length; i++) {
                                var blk = +netSchMatrixObj["time_blocks"][i];
                                if (blk < 1 || blk > 96) {
                                    continue;
                                }
                                var genNames = netSchMatrixObj["gen_names"];
                                //var onBarDCVal = (+dcMatrixObj[genNames[0]]['on_bar_dc'][blk - 1]).toFixed(0);
                                //var offBarDCVal = (+dcMatrixObj[genNames[0]]['off_bar_dc'][blk - 1]).toFixed(0);
                                if (wbesMetric == scheduleStr) {
                                    var schVal = (+netSchMatrixObj[genNames[iter]]['total'][blk - 1]);
                                } else if (wbesMetric == ursStr) {
                                    var schVal = (+netSchMatrixObj[genNames[iter]]['urs'][blk - 1]);
                                } else if (wbesMetric == rrasStr) {
                                    var schVal = (+netSchMatrixObj[genNames[iter]]['rras'][blk - 1]);
                                } else if (wbesMetric == stoaStr) {
                                    var schVal = (+netSchMatrixObj[genNames[iter]]['stoa'][blk - 1]);
                                } else if (wbesMetric == ltaStr) {
                                    var schVal = (+netSchMatrixObj[genNames[iter]]['lta'][blk - 1]);
                                } else if (wbesMetric == mtoaStr) {
                                    var schVal = (+netSchMatrixObj[genNames[iter]]['mtoa'][blk - 1]);
                                } else {
                                    var schVal = 0;
                                }
                                if (iter == 0) {
                                    schVals[i] = 0;
                                }
                                schVals[i] = schVals[i] + schVal;
                            }
                        }
                        speechText = getStatisticSpeechFromBlockVals(schVals, wbesEntity, wbesMetric, statistic, blockNum);
                        return callback(null, { 'speechText': speechText });
                    });
                } else if (wbesMetric == marginStr) {
                    Schedule.getIsgsMarginsObj(utilId, paramDateStr, resolvedRev, function (err, marginsObj) {
                        if (err) {
                            return callback(err);
                        }
                        var marginVals = marginsObj['margins'];
                        speechText = getStatisticSpeechFromBlockVals(marginVals, wbesEntity, wbesMetric, statistic, blockNum);
                        return callback(null, { 'speechText': speechText });
                    });
                }
            };
            var tasksArray = [getDayRevisions, resolveRev, getWbesData];
            async.waterfall(tasksArray, function (err, resObj) {
                if (err) {
                    return callback(err);
                }
                //synthesise the speech text
                return callback(null, { 'speechText': resObj['speechText'] });
            });
        } else {
            speechText = `Sorry, we could not figure out the wbes metric of ${wbesEntity}, please try again...`;
            return callback(null, { 'speechText': speechText });
        }
    } else {
        speechText = 'Sorry, we could not figure out the wbes entity from your query, please try again...';
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