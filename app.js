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