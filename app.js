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
    var speech =
        req.body.queryResult &&
            req.body.queryResult.queryText
            ? req.body.queryResult.queryText
            : "Seems like some problem. Speak again.";
    return res.json({
        fulfillmentText: speech,
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

