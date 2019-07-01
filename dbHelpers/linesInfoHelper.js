"use strict";
// global variables used in this module
var lines = [];
var headings = [];
var ss1Heading = module.exports.ss1Heading = 'End-1';
var ss2Heading = module.exports.ss2Heading = 'End-2';
var lengthHeading = module.exports.lengthHeading = 'Km';
var conductorHeading = module.exports.conductorHeading = 'Conductor Type';
var silHeading = module.exports.silHeading = 'SIL';
var noLoadMvarHeading = module.exports.noLoadMvarHeading = 'No Load MVAR Generated';
var lineOwnerHeading = module.exports.lineOwnerHeading = 'Line Owner';
var ss1OwnerHeading = module.exports.ss1OwnerHeading = 'End-1 Owner';
var ss2OwnerHeading = module.exports.ss2OwnerHeading = 'End-2 Owner';
var voltHeading = module.exports.voltHeading = 'voltage';
var ss1Index = module.exports.ss1Index = -1;
var ss2Index = module.exports.ss2Index = -1;
var lengthIndex = module.exports.lengthIndex = -1;
var conductorIndex = module.exports.conductorIndex = -1;
var silIndex = module.exports.silIndex = -1;
var noLoadMvarIndex = module.exports.noLoadMvarIndex = -1;
var lineOwnerIndex = module.exports.lineOwnerIndex = -1;
var ss1OwnerIndex = module.exports.ss1OwnerIndex = -1;
var ss2OwnerIndex = module.exports.ss2OwnerIndex = -1;
var voltIndex = module.exports.voltIndex = -1;

const readXlsxFile = require('read-excel-file/node');
const appState = require('../appState');

var registerLinesInfoAppState = module.exports.registerLinesInfoAppState = function (obj) {
    appState.registerAppState("lines_info", obj);
}

var getLinesInfoAppState = module.exports.getLinesInfoAppState = function () {
    return appState.getAppState("lines_info");
}

module.exports.initLinesInfoGlobalVar = function (callback) {
    const path = require('path');
    const excelPath = path.join(__dirname, '..', 'dbHelpers', 'lines_info.xlsx');
    readXlsxFile(excelPath).then((rows) => {
        // console.log(rows[0]);
        // console.log(rows[1]);
        
        registerLinesInfoAppState(rows);

        // initialize the lines array in main lineHelper js module
        initLinesArray();
        
        callback(null, getLinesInfoAppState());
    })
}

const initLinesArray = module.exports.initLinesArray = function () {
    //var lines = require('./linesInfo').lines;
    lines = require('./linesInfoHelper').getLinesInfoAppState();
    headings = lines[0];
    ss1Index = headings.indexOf(ss1Heading);
    ss2Index = headings.indexOf(ss2Heading);
    lengthIndex = headings.indexOf(lengthHeading);
    conductorIndex = headings.indexOf(conductorHeading);
    silIndex = headings.indexOf(silHeading);
    noLoadMvarIndex = headings.indexOf(noLoadMvarHeading);
    lineOwnerIndex = headings.indexOf(lineOwnerHeading);
    ss1OwnerIndex = headings.indexOf(ss1OwnerHeading);
    ss2OwnerIndex = headings.indexOf(ss2OwnerHeading);
    voltIndex = headings.indexOf(voltHeading);
}

module.exports.getLineObjBySSNames = function (ss1Str, ss2Str, lineVoltage) {
    var reqLine = null
    //search for the line
    for (let lineIter = 1; lineIter < lines.length; lineIter++) {
        var lineRow = lines[lineIter];
        // todo do better searching by using regex
        var rowSS1 = (lineRow[ss1Index] + '').toLowerCase();
        var rowSS2 = (lineRow[ss2Index] + '').toLowerCase();
        var lowerReqSS1 = (ss1Str + '').toLowerCase();
        var lowerReqSS2 = (ss2Str + '').toLowerCase();
        var rowVolt = (lineRow[voltIndex] + '').toLowerCase();

        if ((rowSS1.indexOf(lowerReqSS1) > -1 && rowSS2.indexOf(lowerReqSS2) > -1) || (rowSS2.indexOf(lowerReqSS1) > -1 && rowSS1.indexOf(lowerReqSS2) > -1)) {
            if (lineVoltage == undefined || lineVoltage == null || lineVoltage == '') {
                // we got a match
                reqLine = lineRow;
                break;
            } else {
                // we have to check for line voltage also
                if (lineVoltage == rowVolt) {
                    // we got a match
                    reqLine = lineRow;
                    break;
                }
            }
        }
    }
    if (reqLine === null) {
        return null;
    }
    // convert this line to dictionary
    var reqLineObj = convertArrayToObj(lines[0], reqLine);
    return reqLineObj;
}

var convertArrayToObj = function (headings, lineRow) {
    var reqLineObj = {};
    for (let headingIter = 0; headingIter < headings.length; headingIter++) {
        reqLineObj[headings[headingIter]] = lineRow[headingIter];
    }
    return reqLineObj
}