"use strict";
var lines = require('./linesInfo').lines;

var headings = module.exports.headings = lines[0];
var ss1Heading = module.exports.ss1Heading = 'End-1';
var ss2Heading = module.exports.ss2Heading = 'End-2';
var lengthHeading = module.exports.lengthHeading = 'Km';
var conductorHeading = module.exports.conductorHeading = 'Conductor Type';
var silHeading = module.exports.silHeading = 'SIL';
var noLoadMvarHeading = module.exports.noLoadMvarHeading = 'No Load MVAR Generated';
var lineOwnerHeading = module.exports.lineOwnerHeading = 'Line Owner';
var ss1OwnerHeading = module.exports.ss1OwnerHeading = 'End-1 Owner';
var ss2OwnerHeading = module.exports.ss2OwnerHeading = 'End-2 Owner';
var ss1Index = module.exports.ss1Index =headings.indexOf(ss1Heading);
var ss2Index = module.exports.ss2Index = headings.indexOf(ss2Heading);
var lengthIndex = module.exports.lengthIndex = headings.indexOf(lengthHeading);
var conductorIndex = module.exports.conductorIndex = headings.indexOf(conductorHeading);
var silIndex = module.exports.silIndex = headings.indexOf(silHeading);
var noLoadMvarIndex = module.exports.noLoadMvarIndex = headings.indexOf(noLoadMvarHeading);
var lineOwnerIndex = module.exports.lineOwnerIndex = headings.indexOf(lineOwnerHeading);
var ss1OwnerIndex = module.exports.ss1OwnerIndex = headings.indexOf(ss1OwnerHeading);
var ss2OwnerIndex = module.exports.ss2OwnerIndex = headings.indexOf(ss2OwnerHeading);

module.exports.getLineObjBySSNames = function (ss1Str, ss2Str) {
    var reqLine = null
    //search for the line
    for (let lineIter = 1; lineIter < lines.length; lineIter++) {
        var lineRow = lines[lineIter];
        // todo do better searching by using regex
        var rowSS1 = (lineRow[ss1Index] + '').toLowerCase();
        var rowSS2 = (lineRow[ss2Index] + '').toLowerCase();
        var lowerReqSS1 = (ss1Str + '').toLowerCase();
        var lowerReqSS2 = (ss2Str + '').toLowerCase();
        
        if ((rowSS1.indexOf(lowerReqSS1) > -1 && rowSS2.indexOf(lowerReqSS2) > -1)||(rowSS2.indexOf(lowerReqSS1) > -1 && rowSS1.indexOf(lowerReqSS2) > -1)) {
            // we got a match
            reqLine = lineRow;
            break;
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