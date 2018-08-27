var lines = require('./linesInfo').lines;

module.exports.getLineObjBySSNames = function (ss1Str, ss2Str) {
    var headings = lines[0];
    var ss1Index = headings.indexOf('end1');
    var ss2Index = headings.indexOf('end2');
    var reqLine = null
    //search for the line
    for (let lineIter = 1; lineIter < lines.length; lineIter++) {
        var lineRow = lines[lineIter];
        if ((lineRow[ss1Index].indexOf(ss1Str) !== -1 && lineRow[ss2Index].indexOf(ss2Str) !== -1)||(lineRow[ss2Index].indexOf(ss1Str) !== -1 && lineRow[ss1Index].indexOf(ss2Str) !== -1)) {
            // we got a match
            reqLine = lineRow;
            break;
        }
    }
    // convert this line to dictionary
    var reqLineObj = convertArrayToObj(lines[0], lineRow);
    return reqLineObj;
}

var convertArrayToObj = function (headings, lineRow) {
    var reqLineObj = {};
    for (let headingIter = 0; headingIter < headings.length; headingIter++) {
        reqLineObj[headings[headingIter]] = lineRow[headingIter];        
    }
    return reqLineObj
}