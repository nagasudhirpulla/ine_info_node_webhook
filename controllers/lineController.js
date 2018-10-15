const router = require('express').Router();
const linesHelper = require("../dbHelpers/lineHelper");
const WbesHelper = require("../dbHelpers/wbesHelper");

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
    var lineVoltage = queryParams && queryParams.voltage && queryParams.voltage[0] ? queryParams.voltage[0] : null;
    if (intentName == 'line_info' && queryParams != null && ss1Name != null && ss2Name != null && lineMetric != null) {
        // we have all required params for giving line info
        var lineObj = linesHelper.getLineObjBySSNames(ss1Name, ss2Name, lineVoltage);
        if (lineObj === null) {
            return res.json({
                fulfillmentText: `Sorry, we could not find the line ${ss1Name} ${ss2Name}, please ask about another line...`,
                source: sourceName
            });
        }
        var speechText = 'Sorry, some problem occured, please speak again...';
        var voltName = lineObj[linesHelper.voltHeading];
        if (["line length", "length", "distance"].indexOf(lineMetric) > -1) {
            var lineLength = lineObj[linesHelper.lengthHeading];
            speechText = `${lineLength} kilometers is ${lineMetric} of ${voltName} KV ${ss1Name} ${ss2Name}, please ask another information...`;
        } else if (["sil", "surge impedance loading"].indexOf(lineMetric) > -1) {
            var sil = lineObj[linesHelper.silHeading];
            speechText = `${sil} is ${lineMetric} of ${voltName} KV ${ss1Name} ${ss2Name}, please ask another information...`;
        } else if (["conductor", "conductor type"].indexOf(lineMetric) > -1) {
            var conductor = lineObj[linesHelper.conductorHeading];
            speechText = `${conductor} is ${lineMetric} of ${voltName} KV ${ss1Name} ${ss2Name}, please ask another information...`;
        } else if (["ownership information", "owner info", "owner information"].indexOf(lineMetric) > -1) {
            var ss1Name = lineObj[linesHelper.ss1Heading];
            var ss2Name = lineObj[linesHelper.ss2Heading];
            var ss1Owner = lineObj[linesHelper.ss1OwnerHeading];
            var ss2Owner = lineObj[linesHelper.ss2OwnerHeading];
            var lineOwner = lineObj[linesHelper.lineOwnerHeading];
            speechText = `${lineOwner} is the line owner of ${voltName} KV ${ss1Name} ${ss2Name}. ${ss1Name} owner is ${ss1Owner}, ${ss2Name} owner is ${ss2Owner}, please ask another information...`;
        } else if (["total information"].indexOf(lineMetric) > -1) {
            var ss1Name = lineObj[linesHelper.ss1Heading];
            var ss2Name = lineObj[linesHelper.ss2Heading];
            var ss1Owner = lineObj[linesHelper.ss1OwnerHeading];
            var ss2Owner = lineObj[linesHelper.ss2OwnerHeading];
            var lineOwner = lineObj[linesHelper.lineOwnerHeading];
            var lineLength = lineObj[linesHelper.lengthHeading];
            var conductor = lineObj[linesHelper.conductorHeading];
            var sil = lineObj[linesHelper.silHeading];
            speechText = `${lineOwner} is the line owner ` +
                `of ${voltName} KV ${ss1Name} ${ss2Name}. ${ss1Name} owner is ${ss1Owner}, ` +
                `${ss2Name} owner is ${ss2Owner}. ` +
                `Line length is ${lineLength}. ` +
                `Conductor type is ${conductor}. ` +
                `S I L is ${sil}, ` +
                `please ask another information...`;
        }
        else {
            speechText = `Sorry, we do not have information regarding the ${lineMetric} of ${ss1Name} ${ss2Name}, please ask about another line characteristic...`
        }
        // return the response
        return res.json({
            fulfillmentText: speechText,
            source: sourceName
        });
    }
    else if (intentName == 'wbes_info' && queryParams != null) {
        //extracting the query parameters
        var wbesEntity = queryParams && queryParams.wbes_entity && queryParams.wbes_entity[0] ? queryParams.wbes_entity[0] : null;
        var wbesMetric = queryParams && queryParams.wbes_metric && queryParams.wbes_metric[0] ? queryParams.wbes_metric[0] : null;
        var blockNum = queryParams && queryParams.block && queryParams.block[0] ? queryParams.block[0] : null;
        var revNum = queryParams && queryParams.revision_number && queryParams.revision_number[0] ? queryParams.revision_number[0] : null;
        var statistic = queryParams && queryParams.statistic && queryParams.statistic[0] ? queryParams.statistic[0] : null;
        var dateStr = queryParams && queryParams.date && queryParams.date[0] ? queryParams.date[0] : null;

        speechText = '';

        // for testing purpose we are echoing the question parameters
        /* var entitySpeeches = [];
        if (wbesEntity != null) {
            entitySpeeches.push(`entity is ${wbesEntity}`);
        }
        if (wbesMetric != null) {
            entitySpeeches.push(`metric is ${wbesMetric}`);
        }
        if (blockNum != null) {
            entitySpeeches.push(`block number is ${blockNum}`);
        }
        if (revNum != null) {
            entitySpeeches.push(`revision is ${revNum}`);
        }
        if (statistic != null) {
            entitySpeeches.push(`statistic is ${statistic}`);
        }
        if (dateStr != null) {
            entitySpeeches.push(`date is ${dateStr}`);
        }

        if (entitySpeeches.length > 0) {
            speechText = entitySpeeches.join(', ');
        } else {
            speechText = 'Sorry I could not figure out any parameters from our query...';
        }
        */
        
        WbesHelper.handleWbesQuery(queryParams, function (err, resObj) {
            // return the response
            if (err) {
                speechText = 'Sorry, some error occured. Please try again...';
            } else {
                speechText = resObj['speechText'];
            }
            return res.json({
                fulfillmentText: speechText,
                source: sourceName
            });
        });

    } else {
        if (intentName == 'line_info' && queryParams != null) {
            var unCapturedVars = [];
            if (ss1Name == null) {
                unCapturedVars.push('from substation');
            }
            if (ss2Name == null) {
                unCapturedVars.push('to substation');
            }
            if (lineMetric == null) {
                unCapturedVars.push('line metric');
            }
            var speechText = `Sorry, we could not extract ${unCapturedVars} from your query, please ask again...`;
        } else {
            speechText = `Sorry, we could not extract all the required parameters from ${queryText}, please ask again...`;
        }
        return res.json({
            fulfillmentText: speechText,
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