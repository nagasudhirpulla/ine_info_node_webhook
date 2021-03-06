"use strict";

const express = require('express');
const bodyParser = require("body-parser");


const app = express();
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(bodyParser.json());

app.use(express.json());

app.use("/line_info", require('./controllers/lineController'));

app.post("/echo", function (req, res) {
    var speechText =
        req.body.queryResult &&
            req.body.queryResult.queryText
            ? req.body.queryResult.queryText
            : "Seems like some problem. Speak again.";

    /*
    "intent": {
      "name": "projects/your-agents-project-id/agent/intents/29bcd7f8-f717-4261-a8fd-2d3e451b8af8",
      "displayName": "Matched Intent Name"
    }
    */

    var intent = req.body.queryResult && req.body.queryResult.intent && req.body.queryResult.intent.displayName ? req.body.queryResult.intent.displayName : null
    var intentText = ""
    if (intent != null) {
        intentText = "The intent of the request was " + intent;
    }
    return res.json({
        fulfillmentText: speechText + intentText,
        source: "webhook-echo-sample"
    });
});

app.get("/", function (req, res) {
    return res.json({
        fulfillmentText: "This is a text response",
        source: "webhook-line-info"
    });
});

app.use(function (err, req, res, next) {
    console.log(err);
    return res.json({
        fulfillmentText: "Sorry, some internal error occured, please try again...",
        source: "webhook-line-info"
    });
});

app.listen(process.env.PORT || 3000, () => console.log('App listening on port 3000!'));

const geoInfo = require('./dbHelpers/geographicalInfoHelper');
geoInfo.initGeoInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);
    console.log(`Completed reading the geographical info into the global varaible`);
    // console.log(geoInfo.getGeoInfoGlobalVar());
});

const genInfo = require('./dbHelpers/generatorInfoHelper');
genInfo.initGenInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);
    console.log(`Completed reading the generator info into the global varaible`);
    // console.log(geoInfo.getGeoInfoGlobalVar());
});

const genUnitInfo = require('./dbHelpers/generatorUnitInfoHelper');
genUnitInfo.initGenUnitInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);
    console.log(`Completed reading the generator units info into the global varaible`);
    // console.log(geoInfo.getGeoInfoGlobalVar());
});

const linesInfo = require('./dbHelpers/linesInfoHelper');
linesInfo.initLinesInfoGlobalVar(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);

    console.log(`Completed reading the transmission lines info into the global varaible`);

    // initialize the lines array in main lineHelper js module
    // require('./dbHelpers/lineHelper').initLinesArray();

    // console.log(linesInfo.getLinesInfoAppState());
});

const shareAllocInfo = require('./dbHelpers/shareAllocInfoHelper');
shareAllocInfo.initShareAllocInfoAppState(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);

    console.log(`Completed reading the share allocation info into the global varaible`);

    // console.log(shareAllocInfo.getShareAllocInfoAppState());
});

const ssInfo = require('./dbHelpers/substationInfoHelper');
ssInfo.initSubstationsInfoAppState(function (errs, data) {
    if (errs != null && errs.length != 0) {
        return console.log(errs);
    }
    // console.log(data);

    console.log(`Completed reading the substations info into the global varaible`);

    // console.log(ssInfo.getSubstationsInfoAppState());
});