const linesInfo = require('../dbHelpers/linesInfoHelper');
linesInfo.initLinesInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data[0]);
    // console.log(data[1]);
    console.log(linesInfo.getLinesInfoAppState()[0]);
    console.log(linesInfo.getLinesInfoAppState()[1]);
});