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

app.post("/echo", function(req, res) {
    var speech =
      req.body.result &&
      req.body.result.parameters &&
      req.body.result.parameters.echoText
        ? req.body.result.parameters.echoText
        : "Seems like some problem. Speak again.";
    return res.json({
      speech: speech,
      displayText: speech,
      source: "webhook-echo-sample"
    });
  });

app.listen(process.env.PORT || 3000, () => console.log('App listening on port 3000!'));

