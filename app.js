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

    var intent = req.body.intent && req.body.intent.name ? req.body.intent.name : null
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
        source: "webhook-echo-sample"
    });
});

app.listen(process.env.PORT || 3000, () => console.log('App listening on port 3000!'));

