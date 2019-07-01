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
        require('./lineHelper').initLinesArray();
        
        callback(null, getLinesInfoAppState());
    })
}