# This a web hook for Grid Info Dialogflow google assistant app

## Instructions to add new wbes entity
1. Add new entity in "wbes_entity" of dialogflow
2. Add new utility id in dbHelpers/utilInfo.js. Note that dictionary key should match with wbes_entity of dialogflow. utilIds can be found at http://scheduling.wrldc.in/wbes/Report/GetUtils?regionId=2

## Links
* Demo node js app code - https://github.com/crm911/dialogflow
* Dialogflow official webhook handling code - https://stackoverflow.com/questions/48967320/how-to-use-dialogflow-communicating-with-heroku
* Heroku getting started with node js - https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up
* Dialogflow Fulfillment docs - https://dialogflow.com/docs/fulfillment
* Use https://shancarter.github.io/mr-data-converter/ to convert csv to javascript array