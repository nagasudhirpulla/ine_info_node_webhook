/**
 * Created by Nagasudhir on 12/10/2017.
 */
var WBESUtils = require("../utils/wbesUtils");
var ArrayHelper = require('../utils/arrayHelpers');
var async = require('async');

var getIsgsDcObj = module.exports.getIsgsDcObj = function (dateStr, rev, utilId, callback) {
    WBESUtils.getISGSDeclarationsArray(dateStr, rev, utilId, function (err, dcMatrixArray) {
        if (err) {
            callback(new Error(err));
            return;
        }
        var dcMatrixDim = ArrayHelper.getDim(dcMatrixArray);
        if (dcMatrixDim.length < 2 || dcMatrixDim[0] < 98 || dcMatrixDim[1] < 5) {
            callback(new Error('DC matrix is not of minimum required shape of 98*5'));
            return;
        }

        // get all the genNames from 1st row
        var dcFirstRow = dcMatrixArray[0];
        var genNames = ArrayHelper.getUniqueList(dcFirstRow.slice(2));

        //trim all generator names
        genNames = genNames.map(Function.prototype.call, String.prototype.trim);

        // exclude grand total (last column) from the genList
        if (genNames[genNames.length - 1].toLowerCase() == 'grand total') {
            genNames = genNames.slice(0, -1);
        }

        // create a dictionary of generators for result object
        var dcObj = {};
        dcObj['gen_names'] = genNames;
        dcObj['time_blocks'] = [];
        var timeBlkColIndex = dcFirstRow.map(Function.prototype.call, String.prototype.trim).map(Function.prototype.call, String.prototype.toLowerCase).indexOf('time block');
        for (var i = 2; i < Math.min(dcMatrixArray.length, 98); i++) {
            dcObj['time_blocks'].push(+dcMatrixArray[i][timeBlkColIndex]);
        }
        for (var i = 0; i < genNames.length; i++) {
            dcObj[genNames[i]] = {};
            dcObj[genNames[i]]['on_bar_dc'] = [];
            dcObj[genNames[i]]['off_bar_dc'] = [];
            dcObj[genNames[i]]['total_dc'] = [];
        }

        // scan through all the columns for generator names and onbar, offbar, total dc values
        for (var matrixCol = 2; matrixCol < dcMatrixArray[0].length; matrixCol++) {
            // get the genName
            var genName = dcMatrixArray[0][matrixCol].trim();
            if (genName == '') {
                // not a generator, so skip to next iteration
                continue;
            }
            var dcType = dcMatrixArray[1][matrixCol];
            if (dcType == null) {
                dcType = "onbardc";
            } else {
                dcType = dcType.trim().toLowerCase();
            }
            var dcTypeStrDict = { 'sellerdc': 'total_dc', 'dc': 'on_bar_dc', 'combineddc': 'on_bar_dc', 'onbardc': 'on_bar_dc', 'offbardc': 'off_bar_dc', 'total': 'total_dc' };
            if (['onbardc', 'offbardc', 'total', 'combineddc', 'dc', 'sellerdc'].indexOf(dcType) > -1) {
                // fill the dc values in the appropriate object array
                var dcValsList = [];
                for (var matrixRow = 2; matrixRow < Math.min(dcMatrixArray.length, 98); matrixRow++) {
                    dcValsList.push(dcMatrixArray[matrixRow][matrixCol]);
                }
                dcObj[genName][dcTypeStrDict[dcType]] = dcValsList;
            }
        }
        return callback(null, dcObj);
    });
};

var getIsgsNetSchObj = module.exports.getIsgsNetSchObj = function (utilId, dateStr, rev, isSeller, callback) {
    WBESUtils.getUtilISGSNetSchedules(utilId, dateStr, rev, isSeller, function (err, netSchMatrixArray) {
        var netSchMatrixDim = ArrayHelper.getDim(netSchMatrixArray);
        if (netSchMatrixDim.length < 2 || netSchMatrixDim[0] < 98 || netSchMatrixDim[1] < 11) {
            callback(new Error('Net Schedules matrix is not of minimum required shape of 98*11'));
            return;
        }

        // get all the genNames from 1st row
        var firstRow = netSchMatrixArray[0];
        var genNames = ArrayHelper.getUniqueList(firstRow.slice(2));

        //trim all generator names
        genNames = genNames.map(Function.prototype.call, String.prototype.trim);

        // exclude grand total (last column) from the genList
        var unwantedColIndex = genNames.map(Function.prototype.call, String.prototype.toLowerCase).indexOf('grand total');
        if (unwantedColIndex != -1) {
            genNames.splice(unwantedColIndex, 1);
        }
        unwantedColIndex = genNames.map(Function.prototype.call, String.prototype.toLowerCase).indexOf('');
        if (unwantedColIndex != -1) {
            genNames.splice(unwantedColIndex, 1);
        }

        // create a dictionary of generators for result object
        var netSchObj = {};
        netSchObj['gen_names'] = genNames;
        netSchObj['time_blocks'] = [];
        var timeBlkColIndex = firstRow.map(Function.prototype.call, String.prototype.trim).map(Function.prototype.call, String.prototype.toLowerCase).indexOf('time block');
        for (var i = 2; i < Math.min(netSchMatrixArray.length, 98); i++) {
            netSchObj['time_blocks'].push(+netSchMatrixArray[i][timeBlkColIndex]);
        }
        for (var i = 0; i < genNames.length; i++) {
            netSchObj[genNames[i]] = {};
            netSchObj[genNames[i]]['isgs'] = [];
            netSchObj[genNames[i]]['mtoa'] = [];
            netSchObj[genNames[i]]['lta'] = [];
            netSchObj[genNames[i]]['stoa'] = [];
            netSchObj[genNames[i]]['iex'] = [];
            netSchObj[genNames[i]]['pxi'] = [];
            netSchObj[genNames[i]]['urs'] = [];
            netSchObj[genNames[i]]['rras'] = [];
            netSchObj[genNames[i]]['total'] = [];
        }

        // scan through all the columns for generator names and onbar, offbar, total dc values
        for (var matrixCol = 2; matrixCol < netSchMatrixArray[0].length; matrixCol++) {
            // get the genName
            var genName = netSchMatrixArray[0][matrixCol].trim();
            if (genName == '') {
                // not a generator, so skip to next iteration
                continue;
            }
            var netSchType = netSchMatrixArray[1][matrixCol].trim().toLowerCase();
            if (['isgs', 'mtoa', 'lta', 'stoa', 'iex', 'pxi', 'urs', 'rras', 'total'].indexOf(netSchType) > -1) {
                // fill the dc values in the appropriate object array
                var dcValsList = [];
                for (var matrixRow = 2; matrixRow < Math.min(netSchMatrixArray.length, 98); matrixRow++) {
                    dcValsList.push(netSchMatrixArray[matrixRow][matrixCol]);
                }
                netSchObj[genName][netSchType] = dcValsList;
            }
        }
        return callback(null, netSchObj);
    });
};

var getISGSURSAvailedObj = module.exports.getISGSURSAvailedObj = function (dateStr, fromTB, toTB, rev, utilId, callback) {
    WBESUtils.getISGSURSAvailedArray(dateStr, rev, utilId, function (err, ursAvailedRows) {
        if (err) {
            callback(new Error(err));
            return;
        }
        var ursAvailedRowsDim = ArrayHelper.getDim(ursAvailedRows);
        if (ursAvailedRowsDim.length < 2 || ursAvailedRowsDim[0] < 102 || ursAvailedRowsDim[1] < 1) {
            callback(new Error('URS availed matrix is not of minimum required shape of 98*1'));
            return;
        }
        if (fromTB == null || isNaN(fromTB)) {
            fromTB = 1;
        }
        if (toTB == null || isNaN(toTB)) {
            toTB = 1;
        }
        // get all the genNames from 1st row
        var genNamesRow = ursAvailedRows[0];
        var consNamesRow = ursAvailedRows[1];
        var URSAvailedInfoArray = []; // list of [gen, cons, min, max] arrays
        for (var colIter = 0; colIter < genNamesRow.length; colIter++) {
            if (genNamesRow[colIter] == null || genNamesRow[colIter] == "") {
                continue;
            }
            var genName = genNamesRow[colIter];
            var consName = consNamesRow[colIter];
            // Now find the range of the URS availed by iterating in the column
            var maxURSAvailed = null;
            var minURSAvailed = null;
            for (var blkIter = fromTB; blkIter < (toTB + 1); blkIter++) {
                var rowIter = blkIter + 1;
                var mwVal = Math.round(Number(ursAvailedRows[rowIter][colIter]));
                if (mwVal > 1) {
                    if (maxURSAvailed == null || mwVal > maxURSAvailed) {
                        maxURSAvailed = mwVal;
                    }
                    if (minURSAvailed == null || mwVal < minURSAvailed) {
                        minURSAvailed = mwVal;
                    }
                }
            }
            if (minURSAvailed != null && maxURSAvailed != null) {
                // we got valid URS summary, so push to the URSAvailedInfoArray array
                URSAvailedInfoArray.push([genName, consName, minURSAvailed, maxURSAvailed]);
            }
        }
        // sort the info by max URS availed
        // https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
        var compareFunc = function (a, b) {
            if (a[3] < b[3])
                return 1;
            if (a[3] > b[3])
                return -1;
            return 0;
        };
        URSAvailedInfoArray.sort(compareFunc);
        return callback(null, URSAvailedInfoArray);
    });
};

var getIsgsMarginsObj = module.exports.getIsgsMarginsObj = function (utilId, date_str, rev, callback) {
    var getDCArray = function (callback) {
        getIsgsDcObj(date_str, rev, utilId, function (err, dcArray) {
            if (err) {
                return callback(err);
            }
            return callback(null, { 'dcObj': dcArray });
        });
    };

    var getUtilNetSchArray = function (resObj, callback) {
        getIsgsNetSchObj(utilId, date_str, rev, true, function (err, schArray) {
            if (err) {
                return callback(err);
            }
            resObj['schObj'] = schArray;
            return callback(null, resObj);
        });
    };

    var computeMargins = function (resObj, callback) {
        const onBarVals = [];
        const schVals = [];
        const numGensToIter = (utilId == 'ALL') ? resObj['dcObj']['gen_names'].length : 1;
        // if utilId is ALL then compute margin for all generators
        for (let genIter = 0; genIter < numGensToIter; genIter++) {
            const genName = resObj['schObj']['gen_names'][genIter];
            //console.log(genName);
            const genNameDC = resObj['dcObj']['gen_names'][genIter];
            //console.log(genNameDC);
            var onBarValsTemp = resObj['dcObj'][genNameDC]['on_bar_dc'];
            var schValsTemp = resObj['schObj'][genName]['total'];
            if (onBarValsTemp == undefined || onBarValsTemp.constructor.name != "Array" || schValsTemp == undefined || schValsTemp.constructor.name != "Array") {
                // arrays not returned so throw an error
                return callback(new Error('Undesired api result found'));
            }
            if (onBarValsTemp.length != schValsTemp.length) {
                //check if dc and schedule array are of same length
                return callback(new Error('schedule and dc arrays are not of same length'));
            }
            if (genIter == 0) {
                // initialize the onbar and schedule arrays to zero for first generator
                for (let iter = 0; iter < onBarValsTemp.length; iter++) {
                    onBarVals[iter] = 0;
                    schVals[iter] = 0;
                }
            }
            for (let iter = 0; iter < onBarValsTemp.length; iter++) {
                onBarVals[iter] += +onBarValsTemp[iter];
                schVals[iter] += +schValsTemp[iter];
            }
        }

        // now compute margin values
        const marginVals = [];
        for (let iter = 0; iter < onBarVals.length; iter++) {
            let dcVal = onBarVals[iter];
            let schVal = schVals[iter];
            let marginVal = +dcVal - +schVal;
            marginVal = (marginVal < 0) ? 0 : marginVal;
            marginVals.push(marginVal);
        }
        return callback(null, { 'margins': marginVals });
    }

    var tasksArray = [getDCArray, getUtilNetSchArray, computeMargins];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            //console.log(err);
            return callback(err);
        }
        //console.log(resObj);
        return callback(null, resObj);
    });
};

var getIsgsDcOnbarSchObj = module.exports.getIsgsDcOnbarSchObj = function (dateStr, rev, utilId, callback) {
    WBESUtils.getISGSDcOnbarSchArray(dateStr, rev, utilId, function (err, dcOnbarSchArray) {
        if (err) {
            callback(new Error(err));
            return;
        }
        var dcOnbarSchDim = ArrayHelper.getDim(dcOnbarSchArray);
        if (dcOnbarSchDim.length < 2 || dcOnbarSchDim[0] < 98 || dcOnbarSchDim[1] < 5) {
            callback(new Error('DC, Onbar, Sch matrix is not of minimum required shape of 98*5'));
            return;
        }

        // get all the genNames from 1st row
        var dcOnbarSchFirstRow = dcOnbarSchArray[0];
        var genNames = ArrayHelper.getUniqueList(dcOnbarSchFirstRow.slice(2));

        //trim all generator names
        genNames = genNames.map(Function.prototype.call, String.prototype.trim);

        // create a dictionary of generators for result object
        var dcOnbarSchObj = {};
        dcOnbarSchObj['gen_names'] = genNames;
        dcOnbarSchObj['time_blocks'] = [];
        var timeBlkColIndex = dcOnbarSchArray[1].map(Function.prototype.call, String.prototype.trim).map(Function.prototype.call, String.prototype.toLowerCase).indexOf('time block');
        for (var i = 2; i < Math.min(dcOnbarSchArray.length, 98); i++) {
            dcOnbarSchObj['time_blocks'].push(+dcOnbarSchArray[i][timeBlkColIndex]);
        }

        // initialize the arrays
        for (var i = 0; i < genNames.length; i++) {
            dcOnbarSchObj[genNames[i]] = {};
            dcOnbarSchObj[genNames[i]]['on_bar_dc'] = [];
            dcOnbarSchObj[genNames[i]]['total_dc'] = [];
            dcOnbarSchObj[genNames[i]]['total'] = [];
        }

        // scan through all the columns for generator names and onbar, sch, total dc values
        for (var matrixCol = 2; matrixCol < dcOnbarSchArray[0].length; matrixCol++) {
            // get the genName
            var genName = dcOnbarSchArray[0][matrixCol].trim();
            if (genName == '') {
                // not a generator, so skip to next iteration
                continue;
            }
            var dcType = dcOnbarSchArray[1][matrixCol].trim().toLowerCase();
            var dcTypeStrDict = { 'dc': 'total_dc', 'dc for sch': 'on_bar_dc', 'schedule': 'total' };
            if (['dc', 'dc for sch', 'schedule'].indexOf(dcType) > -1) {
                // fill the dc values in the appropriate object array
                var dcValsList = [];
                for (var matrixRow = 2; matrixRow < Math.min(dcOnbarSchArray.length, 98); matrixRow++) {
                    dcValsList.push(dcOnbarSchArray[matrixRow][matrixCol]);
                }
                dcOnbarSchObj[genName][dcTypeStrDict[dcType]] = dcValsList;
            }
        }
        return callback(null, dcOnbarSchObj);
    });
};

var getNewIsgsMarginsObj = module.exports.getNewIsgsMarginsObj = function (utilId, date_str, rev, callback) {
    var getDCOnbarSchArray = function (callback) {
        getIsgsDcOnbarSchObj(date_str, rev, utilId, function (err, dcOnbarSchArray) {
            if (err) {
                return callback(err);
            }
            return callback(null, { 'schObj': dcOnbarSchArray });
        });
    };

    var computeMargins = function (resObj, callback) {
        const onBarVals = [];
        const schVals = [];
        const numGensToIter = (utilId == 'ALL') ? resObj['schObj']['gen_names'].length : 1;
        // if utilId is ALL then compute margin for all generators
        for (let genIter = 0; genIter < numGensToIter; genIter++) {
            const genName = resObj['schObj']['gen_names'][genIter];
            //console.log(genName);
            var onBarValsTemp = resObj['schObj'][genName]['on_bar_dc'];
            var schValsTemp = resObj['schObj'][genName]['total'];
            if (onBarValsTemp == undefined || onBarValsTemp.constructor.name != "Array" || schValsTemp == undefined || schValsTemp.constructor.name != "Array") {
                // arrays not returned so throw an error
                return callback(new Error('Undesired api result found'));
            }
            if (onBarValsTemp.length != schValsTemp.length) {
                //check if dc and schedule array are of same length
                return callback(new Error('schedule and dc arrays are not of same length'));
            }
            if (genIter == 0) {
                // initialize the onbar and schedule arrays to zero for first generator
                for (let iter = 0; iter < onBarValsTemp.length; iter++) {
                    onBarVals[iter] = 0;
                    schVals[iter] = 0;
                }
            }
            for (let iter = 0; iter < onBarValsTemp.length; iter++) {
                onBarVals[iter] += +onBarValsTemp[iter];
                schVals[iter] += +schValsTemp[iter];
            }
        }

        // now compute margin values
        const marginVals = [];
        for (let iter = 0; iter < onBarVals.length; iter++) {
            let dcVal = onBarVals[iter];
            let schVal = schVals[iter];
            let marginVal = +dcVal - +schVal;
            marginVal = (marginVal < 0) ? 0 : marginVal;
            marginVals.push(marginVal);
        }
        return callback(null, { 'margins': marginVals });
    }
    var tasksArray = [getDCOnbarSchArray, computeMargins];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            //console.log(err);
            return callback(err);
        }
        //console.log(resObj);
        return callback(null, resObj);
    });
}

var getNewIsgsSchObj = module.exports.getNewIsgsSchObj = function (utilId, date_str, rev, callback) {
    var getDCOnbarSchArray = function (callback) {
        getIsgsDcOnbarSchObj(date_str, rev, utilId, function (err, dcOnbarSchArray) {
            if (err) {
                return callback(err);
            }
            return callback(null, { 'schObj': dcOnbarSchArray });
        });
    };

    var computeSchedules = function (resObj, callback) {
        const schVals = [];
        const numGensToIter = (utilId == 'ALL') ? resObj['schObj']['gen_names'].length : 1;
        // if utilId is ALL then compute margin for all generators
        for (let genIter = 0; genIter < numGensToIter; genIter++) {
            const genName = resObj['schObj']['gen_names'][genIter];
            //console.log(genName);
            var schValsTemp = resObj['schObj'][genName]['total'];
            if (schValsTemp == undefined || schValsTemp.constructor.name != "Array") {
                // arrays not returned so throw an error
                return callback(new Error('Undesired api result found'));
            }

            if (genIter == 0) {
                // initialize the schedule arrays to zero for first generator
                for (let iter = 0; iter < schValsTemp.length; iter++) {
                    schVals[iter] = 0;
                }
            }
            for (let iter = 0; iter < schValsTemp.length; iter++) {
                schVals[iter] += +schValsTemp[iter];
            }
        }

        return callback(null, { 'schedules': schVals });
    }
    var tasksArray = [getDCOnbarSchArray, computeSchedules];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            //console.log(err);
            return callback(err);
        }
        //console.log(resObj);
        return callback(null, resObj);
    });
}

var getAtcSchObj = module.exports.getAtcSchObj = function (dateStr, rev, callback) {
    WBESUtils.getATCMarginArray(dateStr, rev, function (err, atcSchArray) {
        if (err) {
            callback(new Error(err));
            return;
        }
        var atcSchDim = ArrayHelper.getDim(atcSchArray);
        if (atcSchDim.length < 2 || atcSchDim[0] < 98 || atcSchDim[1] < 20) {
            callback(new Error('DC, Onbar, Sch matrix is not of minimum required shape of 98*5'));
            return;
        }

        // get all the genNames from 1st row
        var atcSchFirstRow = atcSchArray[0];
        var atcHeadings = ArrayHelper.getUniqueList(atcSchFirstRow.slice(2));

        //trim all generator names
        atcHeadings = atcHeadings.map(Function.prototype.call, String.prototype.trim);

        // create a dictionary of generators for result object
        var atcSchObj = {};
        var links = ["east_west", "north_west", "west_north", "west_south", "south_west", "west_east"];
        atcSchObj['links'] = links;
        atcSchObj['time_blocks'] = [];
        var timeBlkColIndex = atcSchArray[1].map(Function.prototype.call, String.prototype.trim).map(Function.prototype.call, String.prototype.toLowerCase).indexOf('time block');
        for (var i = 2; i < Math.min(atcSchArray.length, 98); i++) {
            atcSchObj['time_blocks'].push(+atcSchArray[i][timeBlkColIndex]);
        }

        // initialize the link schedule arrays
        for (var i = 0; i < links.length; i++) {
            atcSchObj[links[i]] = {};
            atcSchObj[links[i]]['total'] = [];
            atcSchObj[links[i]]['atc_margin'] = [];
            atcSchObj[links[i]]['net'] = [];
        }

        // scan through all the columns for link names and total, atc_margin, net values
        for (let linkIter = 0; linkIter < links.length; linkIter++) {
            const linkName = links[linkIter];
            const schTypes = ['total', 'atc_margin', 'net'];
            for (let schTypeIter = 0; schTypeIter < schTypes.length; schTypeIter++) {
                const schType = schTypes[schTypeIter];
                var schVals = [];
                var matrixCol = atcSchArray[0].indexOf(linkName + '_' + schType);
                for (var matrixRow = 2; matrixRow < Math.min(atcSchArray.length, 98); matrixRow++) {
                    schVals.push(atcSchArray[matrixRow][matrixCol]);
                }
                atcSchObj[linkName][schType] = schVals;
            }
        }
        return callback(null, atcSchObj);
    });
};

var getAtcSch = module.exports.getAtcSch = function (from_region, to_region, sch_type, date_str, rev, callback) {
    var getAtcSchArray = function (callback) {
        //stub do from here
        getAtcSchObj(date_str, rev, function (err, atcSchObj) {
            if (err) {
                return callback(err);
            }
            return callback(null, { 'schObj':atcSchObj });
        });
    };

    var computeSchedules = function (resObj, callback) {
        const reqLink = from_region + '_' + to_region;
        if (['total', 'atc_margin', 'net'].indexOf(sch_type) < 0) {
            return callback(new Error('Non available schedule type'));
        }
        const schVals = resObj['schObj'][reqLink][sch_type];
        return callback(null, { 'schedules': schVals });
    }
    var tasksArray = [getAtcSchArray, computeSchedules];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            //console.log(err);
            return callback(err);
        }
        //console.log(resObj);
        return callback(null, resObj);
    });
}