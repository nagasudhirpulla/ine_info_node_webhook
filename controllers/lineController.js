const router = require('express').Router();
const linesHelper = require("../dbHelpers/lineHelper");

router.post('/', function (req, res, next) {
    var sourceName = 'webhook-line-info';
    var queryText = req.body.queryResult && req.body.queryResult.queryText ? req.body.queryResult.queryText : null;
    //console.log(req.body);
    if (queryText === null) {
        return res.json({
            fulfillmentText: 'Seems like some problem occured. Kindly speak again...',
            source: sourceName
        });
    }

    var intentName = req.body.queryResult && req.body.queryResult.intent && req.body.queryResult.intent.displayName ? req.body.queryResult.intent.displayName : null;
    var queryParams =
        req.body.queryResult &&
            req.body.queryResult.parameters
            ? req.body.queryResult.parameters
            : null;
    var ss1Name = queryParams && queryParams.from_substation && queryParams.from_substation[0] ? queryParams.from_substation[0] : null;
    var ss2Name = queryParams && queryParams.to_substation && queryParams.to_substation[0] ? queryParams.to_substation[0] : null;
    var lineMetric = queryParams && queryParams.line_metric && queryParams.line_metric[0] ? queryParams.line_metric[0] : null;
    if (intentName == 'line_info' && queryParams != null && ss1Name != null && ss2Name != null && lineMetric != null) {
        // we have all required params for giving line info
        var lineObj = linesHelper.getLineObjBySSNames(ss1Name, ss2Name);
        if (lineObj === null) {
            return res.json({
                fulfillmentText: `Sorry, could not find the line ${ss1Name} ${ss2Name}, please ask about another line...`,
                source: sourceName
            });
        }
        var speechText = 'Sorry, some problem occured, please speak again...';

        if (["line length", "length", "distance"].indexOf(lineMetric) > -1) {
            var lineLength = lineObj[linesHelper.lengthHeading];
            speechText = `${lineLength} kilometers is ${lineMetric} of ${ss1Name} ${ss2Name}, please ask another line information...`;
        } else if (["sil", "surge impedance loading"].indexOf(lineMetric) > -1) {
            var sil = lineObj[linesHelper.silHeading];
            speechText = `${sil} is ${lineMetric} of ${ss1Name} ${ss2Name}, please ask another line information...`;
        } else if (["conductor", "conductor type"].indexOf(lineMetric) > -1) {
            var conductor = lineObj[linesHelper.conductorHeading];
            speechText = `${conductor} is ${lineMetric} of ${ss1Name} ${ss2Name}, please ask another line information...`;
        } else if (["owner info", "owner information"].indexOf(lineMetric) > -1) {
            var ss1Name = lineObj[linesHelper.ss1Heading];
            var ss2Name = lineObj[linesHelper.ss2Heading];
            var ss1Owner = lineObj[linesHelper.ss1OwnerHeading];
            var ss2Owner = lineObj[linesHelper.ss2OwnerHeading];
            var lineOwner = lineObj[linesHelper.lineOwnerHeading];
            speechText = `${lineOwner} is the line owner of ${ss1Name} ${ss2Name}. ${ss1Name} owner is ${ss1Owner}, ${ss2Name} owner is ${ss2Owner}, please ask another line information...`;
        } else {
            speechText = `Sorry, we dont have information regarding the ${lineMetric} of ${ss1Name} ${ss2Name}, please ask about another line characteristic...`
        }

        // return the response
        return res.json({
            fulfillmentText: speechText,
            source: sourceName
        });

    } else {
        return res.json({
            fulfillmentText: `Sorry, could not extract all the required parameters from ${queryText}, please ask again...`,
            source: sourceName
        });
    }

});

module.exports = router;

/*
{
  "responseId": "0cd2fda8-3fef-4fb4-8fda-f2ec101b22a8",
  "queryResult": {
    "queryText": "kolhapur mapusa distance",
    "parameters": {
      "substation": [
        "Kolhapur"
      ],
      "line_metric": [
        "distance"
      ],
      "substation1": [
        "Mapusa"
      ]
    },
    "allRequiredParamsPresent": true,
    "fulfillmentText": "you asked about the distance of Kolhapur and Mapusa",
    "fulfillmentMessages": [
      {
        "text": {
          "text": [
            "you asked about the distance of Kolhapur and Mapusa"
          ]
        }
      }
    ],
    "intent": {
      "name": "projects/test-agent-ad9a8/agent/intents/d97e7a8b-6b2d-4109-98d1-8ab27fa6773b",
      "displayName": "line_info"
    },
    "intentDetectionConfidence": 0.75,
    "languageCode": "en"
  }
}
*/